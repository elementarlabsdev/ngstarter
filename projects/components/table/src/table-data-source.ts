import { DataSource as _DataSource } from '@angular/cdk/collections';
import {
  BehaviorSubject,
  combineLatest,
  isObservable,
  merge,
  Observable,
  of,
  Subject,
  Subscription
} from 'rxjs';
import { map } from 'rxjs/operators';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { SortDirective, Sort } from '@ngstarter/components/sort';
import { Paginator } from '@ngstarter/components/paginator';

export class TableDataSource<T> extends _DataSource<T> {
  /** Stream that emits when a new data array is set on the data source. */
  private readonly _data: BehaviorSubject<T[]>;

  /** Stream emitting render data to the table (depends on ordered data changes). */
  private readonly _renderData: BehaviorSubject<T[]>;

  /** Stream that emits when a new filter string is set on the data source. */
  private readonly _filter = new BehaviorSubject<string>('');

  /** Used to react to internal changes of the paginator that the table needs to be notified about. */
  private readonly _internalPageChanges = new Subject<void>();

  /**
   * Subscription to the changes that should trigger an update to the table's rendered data, such
   * as filtering, sorting, pagination, or base data changes.
   */
  _renderChangesSubscription = Subscription.EMPTY;

  /**
   * Cache for quick filter strings. Maps each data object to its concatenated string representation
   * used for filtering.
   */
  private _quickFilterCache = new WeakMap<T & object, string>();

  /**
   * The filtered set of data that has been matched by the filter string, or all the data if there
   * is no filter. Useful for knowing the set of data the table represents.
   * For example, a 'scrolled' paginator can use this to know the total number of items when
   * pagination has been applied.
   */
  filteredData: T[];

  /**
   * The sorted set of data that has been ordered by the sort state, or all the filtered data if there
   * is no sort. Useful for knowing the set of data the table represents.
   */
  sortedData: T[];

  /** Array of data that should be rendered by the table, where each object represents one row. */
  get data() {
    return this._data.value;
  }
  set data(data: T[]) {
    this._data.next(data);
    if (!this._renderChangesSubscription) {
      this._filterData(data);
    }
  }

  /**
   * Filter term that should be used to filter out objects from the data array. To `TableDataSource`'s
   * default implementation, this string checks for stringification matches anywhere in the object.
   */
  get filter(): string {
    return this._filter.value;
  }
  set filter(filter: string) {
    this._filter.next(filter);
    if (!this._renderChangesSubscription) {
      this._filterData(this.data);
    }
  }

  /**
   * Instance of the MatSort directive used by the table to control its sorting. Sort changes
   * emitted by the MatSort will trigger an update to the table's rendered data.
   */
  get sort(): SortDirective | null {
    return this._sort;
  }
  set sort(sort: SortDirective | null) {
    this._sort = sort;
    this._updateChangeSubscription();
  }
  private _sort: SortDirective | null = null;

  /**
   * Instance of the Paginator component used by the table to control what page of the data is
   * displayed. Page changes emitted by the Paginator will trigger an update to the
   * table's rendered data.
   */
  get paginator(): Paginator | null {
    return this._paginator;
  }
  set paginator(paginator: Paginator | null) {
    this._paginator = paginator;
    this._updateChangeSubscription();
  }
  private _paginator: Paginator | null = null;

  /**
   * Data accessor function that is used for accessing data properties for sorting through
   * the default sortData function.
   * This default function assumes that the data objects are flat and can be accessed directly by
   * the column name.
   */
  sortingDataAccessor: (data: T, sortHeaderId: string) => string | number = (
    data: T,
    sortHeaderId: string,
  ): string | number => {
    const value = (data as unknown as Record<string, any>)[sortHeaderId];
    return typeof value === 'number' || typeof value === 'string' ? value : '' + value;
  };

  /**
   * Gets a sorted copy of the data array based on the state of the MatSort. Called
   * after changes are made to the filtered data or when sort changes are emitted from MatSort.
   * By default, the function retrieves the active sort and its direction and compares data
   * objects by retrieving data using the sortingDataAccessor. May be overridden for a
   * custom implementation of data ordering.
   * @param data The array of data that should be sorted.
   * @param sort The connected MatSort that holds the current sort state.
   */
  sortData: (data: T[], sort: SortDirective) => T[] = (data: T[], sort: SortDirective): T[] => {
    const active = typeof sort.active === 'function' ? sort.active() : sort.active;
    const direction = typeof sort.direction === 'function' ? sort.direction() : sort.direction;
    if (!active || direction === '') {
      return data;
    }

    return data.slice().sort((a, b) => {
      const valueA = this.sortingDataAccessor(a, active);
      const valueB = this.sortingDataAccessor(b, active);

      // If both valueA and valueB are numbers, use the numeric comparison.
      // If either valueA or valueB is not a number, use the string comparison.
      const comparatorResult =
        typeof valueA === 'number' && typeof valueB === 'number'
          ? valueA - valueB
          : (valueA + '').localeCompare(valueB + '');

      return comparatorResult * (direction === 'asc' ? 1 : -1);
    });
  };

  /**
   * Checks if a data object matches the data source's filter string. By default, each data object
   * is converted to a string of its properties and returns true if the filter has at least one
   * occurrence in that string. By default, the filter string has its whitespace trimmed and the match
   * is case-insensitive. May be overridden for a custom implementation of filter matching.
   * @param data Data object used to check against the filter.
   * @param filter Filter string that has been set on the data source.
   * @returns Whether the filter matches the data.
   */
  filterPredicate: (data: T, filter: string) => boolean = (data: T, filter: string): boolean => {
    // Transform the filter by converting it to lowercase and splitting into words.
    const transformedFilter = filter.trim().toLowerCase();
    if (!transformedFilter) {
      return true;
    }
    const filterWords = transformedFilter.split(/\s+/);

    // Get the string representation of the data.
    const dataStr = this._getQuickFilterString(data);

    // Check if all filter words are present in the data string (any order).
    return filterWords.every(word => dataStr.indexOf(word) !== -1);
  };

  /**
   * Gets a string representation of the data object used for quick filtering.
   * Caches the result to improve performance.
   * @param data
   * @private
   */
  private _getQuickFilterString(data: T): string {
    if (typeof data !== 'object' || data === null) {
      return String(data).toLowerCase();
    }

    let cached = this._quickFilterCache.get(data as T & object);
    if (cached !== undefined) {
      return cached;
    }

    const dataStr = Object.keys(data as unknown as Record<string, any>)
      .reduce((currentTerm: string, key: string) => {
        const val = (data as unknown as Record<string, any>)[key];
        return currentTerm + (val === null || val === undefined ? '' : val) + ' ';
      }, '')
      .toLowerCase();

    this._quickFilterCache.set(data as T & object, dataStr);
    return dataStr;
  }

  constructor(initialData: T[] = []) {
    super();
    this._data = new BehaviorSubject<T[]>(initialData);
    this._renderData = new BehaviorSubject<T[]>(initialData);
    this.filteredData = initialData;
    this.sortedData = initialData;
    this._updateChangeSubscription();
  }

  /**
   * Subscribe to changes that should trigger an update to the table's rendered data.
   */
  _updateChangeSubscription() {
    const sortChange: Observable<Sort | null | void> = this._sort
      ? (merge(
          this._observeOutput<Sort>(this._sort.sortChange),
          this._sort.initialized || of(undefined),
          of(undefined)
        ) as Observable<Sort | void>)
      : of(null);
    const pageChange: Observable<any> = this._paginator
      ? (merge(
          this._observeOutput<any>(this._paginator.page as any),
          this._internalPageChanges,
          this._paginator.initialized || of(undefined),
          of(undefined)
        ) as Observable<any>)
      : of(null);
    const dataStream = this._data;

    // Watch for base data or filter changes to provide a filtered set of data.
    const filteredData = combineLatest([dataStream, this._filter]).pipe(
      map(([data]) => this._filterData(data)),
    );

    // Watch for filtered data or sort changes to provide an ordered set of data.
    const orderedData = combineLatest([filteredData, sortChange]).pipe(
      map(([data]) => this._orderData(data)),
    );

    // Watch for ordered data or page changes to provide a paged set of data.
    const paginatedData = combineLatest([orderedData, pageChange]).pipe(
      map(([data]) => this._pageData(data)),
    );

    // Watched for paged data changes and emit the result to the table to render.
    this._renderChangesSubscription.unsubscribe();
    this._renderChangesSubscription = paginatedData.subscribe((data) =>
      this._renderData.next(data),
    );
  }

  private _observeOutput<R>(output: any): Observable<R> {
    if (isObservable(output)) {
      return output as Observable<R>;
    }

    if (typeof output === 'object' && output !== null && ('subscribe' in output || 'emit' in output)) {
      return new Observable<R>((subscriber) => {
        try {
          const obs = outputToObservable(output);
          const sub = obs.subscribe({
            next: (value: any) => subscriber.next(value as R),
            error: (err) => {
              if (err && err.message && err.message.includes('NG0911')) {
                subscriber.complete();
              } else {
                subscriber.error(err);
              }
            },
            complete: () => subscriber.complete(),
          });
          return () => sub.unsubscribe();
        } catch (e: any) {
          if (e && e.message && e.message.includes('NG0911')) {
            subscriber.complete();
            return;
          }
          throw e;
        }
      });
    }

    return of() as Observable<R>;
  }

  /**
   * Returns a filtered data array where each filter object contains the filter string within
   * the result of the filterPredicate function. If no filter is set, returns the entire data
   * array without changes.
   */
  _filterData(data: T[]) {
    this.filteredData = !this.filter
      ? data
      : data.filter((obj) => this.filterPredicate(obj, this.filter));

    if (this.paginator) {
      this._updatePaginator(this.filteredData.length);
    }

    return this.filteredData;
  }

  /**
   * Returns a sorted copy of the data if MatSort has a sort applied, otherwise just returns the
   * data array entirely.
   */
  _orderData(data: T[]): T[] {
    // If there is no active sort or direction, then the data should not be ordered.
    if (!this.sort) {
      this.sortedData = data;
      return data;
    }

    this.sortedData = this.sortData(data.slice(), this.sort);
    return this.sortedData;
  }

  /**
   * Returns a paged splice of the provided data array based on the provided Paginator's page
   * index and length. If there is no paginator provided, returns the data array as is.
   */
  _pageData(data: T[]): T[] {
    if (!this.paginator) {
      return data;
    }

    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.slice(startIndex, startIndex + (this.paginator.pageSize as any));
  }

  /**
   * Updates the paginator to reflect the length of the filtered data, and makes sure that the page
   * index does not exceed the amount of pages in the new data set.
   */
  _updatePaginator(filteredDataLength: number) {
    if (!this.paginator) {
      return;
    }

    this.paginator.length = filteredDataLength;

    // If the page index is now larger than the number of pages, move the page index to the last
    // page.
    if (this.paginator.pageIndex > 0) {
      const lastPageIndex = Math.max(0, Math.ceil(this.paginator.length / this.paginator.pageSize) - 1);
      const newPageIndex = Math.min(this.paginator.pageIndex, lastPageIndex);

      if (newPageIndex !== this.paginator.pageIndex) {
        this.paginator.pageIndex = newPageIndex;

        // Since the paginator has changed, notify the data source that the rendered data
        // should be updated.
        this._internalPageChanges.next();
      }
    }
  }

  /**
   * Used by the CdkTable. Called when it connects to the data source.
   * @docs-private
   */
  connect() {
    if (!this._renderChangesSubscription || this._renderChangesSubscription.closed) {
      this._updateChangeSubscription();
    }

    return this._renderData;
  }

  /**
   * Used by the CdkTable. Called when it disconnects from the data source.
   * @docs-private
   */
  disconnect() {
    this._renderChangesSubscription.unsubscribe();
    this._renderChangesSubscription = Subscription.EMPTY;
  }
}
