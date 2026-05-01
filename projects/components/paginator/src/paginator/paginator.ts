import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  OnInit,
  afterNextRender,
  output,
  effect,
  untracked
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Icon } from '@ngstarter-ui/components/icon';
import { Option, Select } from '@ngstarter-ui/components/select';
import { FormField } from '@ngstarter-ui/components/form-field';
import { Button } from '@ngstarter-ui/components/button';
import { PaginatorIntl } from '../paginator-intl';
import {
  DEFAULT_PAGE_SIZE,
  PageEvent,
  PAGINATOR_DEFAULT_OPTIONS
} from '../paginator-interfaces';

@Component({
  selector: 'ngs-paginator',
  exportAs: 'ngsPaginator',
  imports: [Button, Tooltip, Icon, Option, Select, FormField],
  templateUrl: './paginator.html',
  styleUrl: './paginator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-paginator',
    'role': 'group',
  },
})
export class Paginator implements OnInit, OnDestroy {
  private _changeDetectorRef = inject(ChangeDetectorRef);
  _intl = inject(PaginatorIntl);

  private _intlChanges: Subscription;

  /** The zero-based page index of the displayed list of items. Defaulted to 0. */
  pageIndexInput = input(undefined, { transform: numberAttribute, alias: 'pageIndex' });
  get pageIndex(): number {
    return this._pageIndex;
  }
  set pageIndex(value: number) {
    this._pageIndex = Math.max(value || 0, 0);
    this._changeDetectorRef.markForCheck();
  }
  private _pageIndex = 0;

  lengthInput = input(undefined, { transform: numberAttribute, alias: 'length' });
  get length(): number {
    return this._length;
  }
  set length(value: number) {
    this._length = value || 0;
    this._changeDetectorRef.markForCheck();
  }
  private _length = 0;

  /** Number of items to display on a page. By default set to 50. */
  pageSizeInput = input(undefined, { transform: numberAttribute, alias: 'pageSize' });
  get pageSize(): number {
    return this._pageSize;
  }
  set pageSize(value: number) {
    this._pageSize = Math.max(value || 0, 0);
    this._updateDisplayedPageSizeOptions();
  }
  private _pageSize: number;

  /** The set of provided page size options to display to the user. */
  pageSizeOptionsInput = input<number[] | undefined>(undefined, { alias: 'pageSizeOptions' });
  get pageSizeOptions(): number[] {
    return this._pageSizeOptions;
  }
  set pageSizeOptions(value: number[]) {
    this._pageSizeOptions = (value || []).map((p) => numberAttribute(p, 0));
    this._updateDisplayedPageSizeOptions();
  }
  private _pageSizeOptions: number[] = [];

  /** Whether to hide the page size selection UI from the user. */
  hidePageSize = input(false, { transform: booleanAttribute });

  /** Whether to show the first/last buttons UI to the user. */
  showFirstLastButtons = input(false, { transform: booleanAttribute });

  /** Whether the paginator is disabled. */
  disabled = input(false, { transform: booleanAttribute });

  /** Event emitted when the paginator changes the page size or page index. */
  readonly page = output<PageEvent>();

  _initialized = new Subject<void>();
  initialized = this._initialized.asObservable();
  _displayedPageSizeOptions: number[];

  private _isInitialized = false;

  constructor() {
    const defaults = inject(PAGINATOR_DEFAULT_OPTIONS, { optional: true });

    if (defaults) {
      if (defaults.pageSize != null) {
        this._pageSize = defaults.pageSize;
      }
      if (defaults.pageSizeOptions != null) {
        this._pageSizeOptions = defaults.pageSizeOptions;
      }
    }

    if (this._intl && this._intl.changes) {
      this._intlChanges = this._intl.changes.subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
    }

    effect(() => {
      const pageIndex = this.pageIndexInput();
      if (pageIndex !== undefined) {
        untracked(() => this.pageIndex = pageIndex);
      }
    });
    effect(() => {
      const pageSize = this.pageSizeInput();
      if (pageSize !== undefined) {
        untracked(() => this.pageSize = pageSize);
      }
    });
    effect(() => {
      const length = this.lengthInput();
      if (length !== undefined) {
        untracked(() => this.length = length);
      }
    });
    effect(() => {
      const pageSizeOptions = this.pageSizeOptionsInput();
      if (pageSizeOptions !== undefined) {
        untracked(() => this.pageSizeOptions = pageSizeOptions);
      }
    });
    afterNextRender(() => {
      this._initialized.next();
      this._initialized.complete();
    });
  }

  ngOnInit() {
    this._isInitialized = true;
    this._updateDisplayedPageSizeOptions();
  }

  ngOnDestroy() {
    this._intlChanges?.unsubscribe();
  }

  /** Advances to the next page if it exists. */
  nextPage(): void {
    if (this.hasNextPage()) {
      const previousPageIndex = this.pageIndex;
      this._pageIndex++;
      this._emitPageEvent(previousPageIndex);
    }
  }

  /** Move back to the previous page if it exists. */
  previousPage(): void {
    if (this.hasPreviousPage()) {
      const previousPageIndex = this.pageIndex;
      this._pageIndex--;
      this._emitPageEvent(previousPageIndex);
    }
  }

  /** Move to the first page if not already there. */
  firstPage(): void {
    if (this.hasPreviousPage()) {
      const previousPageIndex = this.pageIndex;
      this._pageIndex = 0;
      this._emitPageEvent(previousPageIndex);
    }
  }

  /** Move to the last page if not already there. */
  lastPage(): void {
    if (this.hasNextPage()) {
      const previousPageIndex = this.pageIndex;
      this._pageIndex = this.getNumberOfPages() - 1;
      this._emitPageEvent(previousPageIndex);
    }
  }

  /** Whether there is a previous page. */
  hasPreviousPage(): boolean {
    return this.pageIndex >= 1 && this.pageSize !== 0;
  }

  /** Whether there is a next page. */
  hasNextPage(): boolean {
    const maxPageIndex = this.getNumberOfPages() - 1;
    return this.pageIndex < maxPageIndex && this.pageSize !== 0;
  }

  /** Calculate the number of pages */
  getNumberOfPages(): number {
    if (!this.pageSize) {
      return 0;
    }

    return Math.ceil(this.length / this.pageSize);
  }

  /**
   * Changes the page size so that the first item displayed on the page will still be
   * displayed using the new page size.
   *
   * For example, if the page size is 10 and on the second page (items indexed 10-19) then
   * switching so that the page size is 5 will set the third page as the current page so
   * that the 10th item will still be displayed.
   */
  _changePageSize(pageSize: number) {
    // Current page needs to be updated to reflect the new page size. Navigate to the page
    // containing the previous page's first item.
    const startIndex = this.pageIndex * this.pageSize;
    const previousPageIndex = this.pageIndex;

    this._pageSize = pageSize;
    this._pageIndex = Math.floor(startIndex / pageSize) || 0;

    this._emitPageEvent(previousPageIndex);
  }

  /** Checks whether the buttons for going forwards should be disabled. */
  _nextButtonsDisabled() {
    return this.disabled() || !this.hasNextPage();
  }

  /** Checks whether the buttons for going backwards should be disabled. */
  _previousButtonsDisabled() {
    return this.disabled() || !this.hasPreviousPage();
  }

  /**
   * Updates the list of page size options to display to the user. Includes making sure that
   * the page size is an option and that the list is sorted.
   */
  private _updateDisplayedPageSizeOptions() {
    if (!this._isInitialized) {
      return;
    }

    // If no page size is provided, use the first page size option or the default page size.
    if (!this.pageSize) {
      this._pageSize =
        this.pageSizeOptions.length !== 0 ? this.pageSizeOptions[0] : DEFAULT_PAGE_SIZE;
    }

    this._displayedPageSizeOptions = this.pageSizeOptions.slice();

    if (this._displayedPageSizeOptions.indexOf(this.pageSize) === -1) {
      this._displayedPageSizeOptions.push(this.pageSize);
    }

    // Sort the numbers using a number-specific sort function.
    this._displayedPageSizeOptions.sort((a, b) => a - b);
    this._changeDetectorRef.markForCheck();
  }

  /** Emits a page event and clears the session-cached page index if applicable. */
  private _emitPageEvent(previousPageIndex: number) {
    this.page.emit({
      previousPageIndex,
      pageIndex: this._pageIndex,
      pageSize: this._pageSize,
      length: this.length,
    });
  }
}
