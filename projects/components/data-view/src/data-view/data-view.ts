import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed, contentChild, DestroyRef, effect, ElementRef, forwardRef,
  inject, Injector,
  input,
  model,
  NgZone,
  OnInit,
  output, PLATFORM_ID, signal, TemplateRef, untracked,
  viewChild
} from '@angular/core';
import {
  Table, TableDataSource
} from '@ngstarter-ui/components/table';
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateIcon
} from '@ngstarter-ui/components/empty-state';
import { Icon } from '@ngstarter-ui/components/icon';
import { Alert } from '@ngstarter-ui/components/alert';
import {
  DataViewInterface,
  DataViewAPI,
  DataViewCellRendererDef,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams,
  DataViewRowModelType,
  DataViewRowSelectionEvent, DATA_VIEW, DataViewState, DataViewPinAlign, DataViewRowId, DataViewSelectionScope, DataViewSelectionState, DataViewFilterModel, DataViewColumnFilter, DataViewViewState, DataViewSavedView,
} from '../types';
import { DataViewSelection } from '../selection';
import { dataViewFilterLabel, matchesDataViewFilter, normalizeDataViewFilter, normalizeDataViewFilters } from '../filters';
import { DataViewColumnFilterDialog } from '../column-filter-dialog/column-filter-dialog';
import { Chip, ChipSet, ChipRemove } from '@ngstarter-ui/components/chips';
import { normalizeDataViewState, normalizeDataViewSavedViews } from '../view-state';
import { DataViewSavedViewDialog } from '../saved-view-dialog/saved-view-dialog';
import { FormsModule } from '@angular/forms';
import { FormField } from '@ngstarter-ui/components/form-field';
import { Select, Option } from '@ngstarter-ui/components/select';
import { Toolbar, ToolbarItem, ToolbarSpacer } from '@ngstarter-ui/components/toolbar';
import { PageEvent, Paginator } from '@ngstarter-ui/components/paginator';
import { SortDirective, SortHeader, Sort } from '@ngstarter-ui/components/sort';
import { SortDirection } from '@ngstarter-ui/components/sort';
import { isPlatformBrowser, NgComponentOutlet, NgStyle, NgTemplateOutlet, DOCUMENT } from '@angular/common';
import { DataViewEmptyDataDirective } from '../data-view-empty-data.directive';
import { DataViewEmptyFilterResultsDirective } from '../data-view-empty-filter-results.directive';
import { DataViewActionBarDirective } from '../data-view-action-bar.directive';
import { DataViewActionBar } from '../data-view-action-bar/data-view-action-bar';
import { Checkbox, CheckboxChange } from '@ngstarter-ui/components/checkbox';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { BlockLoader, BlockLoaderContainerDirective } from '@ngstarter-ui/components/block-loader';
import { Button } from '@ngstarter-ui/components/button';
import { Menu, MenuItem, MenuTrigger, MenuDivider, MenuContent } from '@ngstarter-ui/components/menu';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { DataViewColumnSettingsDialog, ColumnSettingsDialogResult } from './column-settings-dialog/column-settings-dialog';
import { DATA_VIEW_CONFIG } from '../config';
import { fromEvent, takeUntil, finalize, take, timer, Subject, merge } from 'rxjs';

let nextDataViewId = 0;

@Component({
  selector: 'ngs-data-view',
  exportAs: 'ngsDataView',
  imports: [
    Checkbox,
    SortHeader,
    SortDirective,
    NgComponentOutlet,
    NgTemplateOutlet,
    Paginator,
    ScrollbarArea,
    NgStyle,
    EmptyState,
    EmptyStateIcon,
    EmptyStateContent,
    Icon,
    Alert,
    Chip, ChipSet, ChipRemove,
    FormsModule, FormField, Select, Option, Toolbar, ToolbarItem, ToolbarSpacer,
    BlockLoader,
    BlockLoaderContainerDirective,
    Button,
    Menu,
    MenuItem,
    MenuTrigger,
    MenuDivider,
    MenuContent,
  ],
  templateUrl: './data-view.html',
  styleUrl: './data-view.scss',
  providers: [
    {
      provide: DATA_VIEW,
      useExisting: forwardRef(() => DataView),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-data-view',
    '[class.highlight-header]': 'highlightHeader()',
    '[class.pinned-header]': 'stickyHeader()',
    '[class.hover-rows]': 'hoverRows()',
    '[class.is-loading]': 'blockingLoading()',
    '[class.embedded]': 'embedded()',
    '[class.has-horizontal-scroll]': 'hasHorizontalScroll()',
    '[class.is-browser]': 'isBrowser()',
    '[class.allow-row-click-selection]': 'allowSingleRowSelectionByClick()',
    '[style.--ngs-data-view-header-height.px]': 'headerHeight()',
    '[style.--ngs-data-view-selection-column-width.px]': 'selectionWidth()',
    '[class.is-auto-height]': 'autoHeight()',
  }
})
export class DataView<T> implements OnInit, AfterViewInit, DataViewInterface<T> {
  protected readonly gridId = `ngs-data-view-${nextDataViewId++}`;
  ariaLabel = input('Data table');
  readonly rowActivated = output<T>();
  protected activeCell = signal({ row: 0, column: 0 });
  private _selectionAnchor = 0;
  protected logicalColumns = computed(() => [
    ...(this.withSelection() ? ['__selection'] : []), ...this.pinnedLeftColumns().map(c => c.field),
    ...this.centerColumns().map(c => c.field), ...this.pinnedRightColumns().map(c => c.field),
    ...(this.actionBarTemplateRef ? ['__actions'] : [])
  ]);
  protected activeCellId = computed(() => {
    const active = this.activeCell(); const field = this.logicalColumns()[active.column];
    return field && this.visibleRows().some(row => row.index === active.row) ? this.cellId(active.row, field) : null;
  });
  protected ariaRowCount = computed(() => this.rowModelType() === 'serverSide'
    ? this._serverCountKnown() ? this._serverSideRowCount() + 1 : -1 : this.effectivePaginatorLength() + 1);
  private _cdr = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);
  private _platformId = inject(PLATFORM_ID);
  private _ngZone = inject(NgZone);
  private _doc = inject(DOCUMENT);
  private _config = inject(DATA_VIEW_CONFIG, { optional: true });
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef as any);
  private _dialog = inject(Dialog);

  private _isDestroyed = false;

  private _requestId = 0;
  private _lastRequestKey: string | null = null;
  private _lastDatasource: DataViewDatasource | null = null;
  private _lastRowModelType: DataViewRowModelType | null = null;
  private _pendingRequestCleanup: (() => void) | null = null;
  private _refreshTrigger = signal(0);
  private _serverSideRowCount = signal(0);
  private _serverCountKnown = signal(false);
  private _manualOrder = signal<string[] | null>(null);
  private _manualVisibility = signal<Record<string, boolean>>({});
  private _hasDataOnServer = signal<boolean | undefined>(undefined);

  private _internalLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly refreshing = computed(() => this._internalLoading() && this.loaded());
  readonly loadStatus = computed(() => this.error() ? 'error' : this._internalLoading()
    ? (this.loaded() ? 'refreshing' : 'loading') : this.loaded() ? 'ready' : 'idle');
  readonly loadError = output<unknown>();
  protected blockingLoading = computed(() => this.loading() || (this._internalLoading() && !this.loaded()));
  sortState = model<Sort>({ active: '', direction: '' });
  columnFilters = model<DataViewFilterModel>({});
  withSavedViews = input(this._config?.withSavedViews ?? false, { transform: booleanAttribute });
  savedViews = model<DataViewSavedView[]>([]);
  viewStorageKey = input<string | null>(null);
  private _activeViewId = signal<string | null>(null);
  readonly activeViewId = this._activeViewId.asReadonly();
  readonly viewStorageError = signal<string | null>(null);
  readonly stateChanged = output<DataViewViewState>();
  readonly viewApplied = output<DataViewSavedView | null>();
  private _initialFullState: DataViewViewState | null = null;
  private _storageReady = signal(false);
  protected dirtyView = computed(() => {
    const view = this.savedViews().find(v => v.id === this.activeViewId());
    return !!view && JSON.stringify(normalizeDataViewState(view.state, this.normalizedColumns()))
      !== JSON.stringify(normalizeDataViewState(this.getState(), this.normalizedColumns()));
  });
  protected normalizedFilters = computed(() => {
    const filters = normalizeDataViewFilters(this.columnFilters());
    const columns = new Map(this.columnDefs().map(column => [column.field, { ...this.defaultColDef(), ...column }]));
    for (const field of Object.keys(filters)) {
      const column = columns.get(field);
      if (!column) delete filters[field];
      else if (column.filter && column.filter.type !== filters[field].type) throw new Error(`Filter type must be ${column.filter.type}`);
    }
    return filters;
  });
  protected activeFilters = computed(() => Object.entries(this.normalizedFilters()).map(([field, filter]) => {
    const column = this.normalizedColumns().find(c => c.field === field);
    const detail = filter.type === 'enum' ? filter.values.map(value => column?.filter?.options?.find(o => o.value === value)?.label ?? value).join(', ') : dataViewFilterLabel(filter);
    return { field, label: `${column?.name ?? field}: ${detail}` };
  }));
  protected _isFiltering = signal(false);
  protected _isSorting = signal(false);

  private _emptyDataRef = contentChild(DataViewEmptyDataDirective);
  protected _emptyFilterResults = contentChild(DataViewEmptyFilterResultsDirective);
  protected _actionBarRef = contentChild(DataViewActionBarDirective);
  protected _actionBarComp = contentChild(DataViewActionBarDirective, { read: DataViewActionBar });
  private _table = viewChild<Table<T>>('table');
  private _ngsSort = viewChild(SortDirective);
  private _internalPaginator = viewChild(Paginator);
  // Optional external paginator passed from parent. If provided, it overrides the internal one.
  paginator = input<Paginator | null>(null);

  private _dataSource = new TableDataSource<T>([]);

  // ViewChildren for scroll synchronization
  private _headerCenter = viewChild('headerCenter', { read: ElementRef<HTMLElement> });
  private _headerCenterInner = viewChild('headerCenterInner', { read: ElementRef<HTMLElement> });
  private _bodyLeftContent = viewChild('bodyLeftContent', { read: ElementRef<HTMLElement> });
  private _scrollbarArea = viewChild(ScrollbarArea);
  private _bodyCenterContent = viewChild('bodyCenterContent', { read: ElementRef<HTMLElement> });
  private _bodyRightContent = viewChild('bodyRightContent', { read: ElementRef<HTMLElement> });

  columnDefs = input<DataViewColumnDef[]>([]);
  defaultColDef = input<Partial<DataViewColumnDef>>(this._config?.defaultColDef ?? {});
  data = input<T[]>([]);
  datasource = input<DataViewDatasource | null>(null);
  rowHeight = input(this._config?.rowHeight ?? 50, { transform: (v: any) => parseInt(v, 10) || this._config?.rowHeight || 50 });
  headerHeight = input(this._config?.headerHeight ?? 50, { transform: (v: any) => parseInt(v, 10) || this._config?.headerHeight || 50 });
  bufferRows = input(this._config?.bufferRows ?? 10, { transform: (v: any) => parseInt(v, 10) || this._config?.bufferRows || 10 });
  withSelection = input(false, {
    transform: booleanAttribute
  });
  highlightHeader = input(false, {
    transform: booleanAttribute
  });
  rowModelType = input<DataViewRowModelType>('clientSide');
  autoHeight = input(this._config?.autoHeight ?? false, {
    transform: booleanAttribute
  });
  stickyHeader = input(this._config?.stickyHeader ?? true, {
    transform: booleanAttribute
  });
  withPagination = input(this._config?.withPagination ?? false, {
    transform: booleanAttribute
  });
  bodyScroll = input(false, {
    transform: booleanAttribute
  });
  pageSizeOptions = input<number[]>(this._config?.pageSizeOptions ?? [5, 10, 20]);
  showFirstLastButtons = input(this._config?.showFirstLastButtons ?? false, {
    transform: booleanAttribute
  });
  paginatorAriaLabel = input<string>('');
  pageSize = model<number>(this._config?.pageSize ?? 10);
  pageIndex = model<number>(0);
  snapshot = input<DataViewState[] | null>(null);
  withColumnSettings = input(false, { transform: booleanAttribute });
  embedded = input(this._config?.embedded ?? false, { transform: booleanAttribute });
  rowSelection = input<'single' | 'multiple'>(this._config?.rowSelection ?? 'multiple');
  getRowId = input<((row: T) => DataViewRowId) | null>(null);
  selectionScope = input<DataViewSelectionScope>('filtered');
  allowSingleRowSelectionByClick = input(this._config?.allowSingleRowSelectionByClick ?? false, { transform: booleanAttribute });
  selectionWidth = input(this._config?.selectionWidth ?? 52, { transform: (v: any) => parseInt(v, 10) || this._config?.selectionWidth || 52 });
  minColumnWidth = input(this._config?.minColumnWidth ?? 50, { transform: (v: any) => parseInt(v, 10) || this._config?.minColumnWidth || 40 });

  private _lastScrollTop = 0;
  private _lastScrollLeft = 0;

  // Virtualization state
  private _scrollTop = signal(0);
  private _viewportHeight = signal(0);
  private _viewportWidth = signal(0);
  protected loaded = signal(false);
  protected isBrowser = signal(false);

  protected hoveredRowIndex = signal<number | null>(null);

  private _initialViewState = signal<DataViewState[]>([]);

  // Resize and Pin state
  private _manualWidths = signal<Record<string, DataViewColumnDef['width'] | undefined>>({});
  private _manualPinned = signal<Record<string, { pinned: boolean, pinAlign: DataViewPinAlign } | undefined>>({});
  private _isResizing = signal(false);
  private _resizeLineLeft = signal(0);
  private _resizeStartX = 0;
  private _resizeStartWidth = 0;
  private _resizeColField: string | null = null;

  protected isResizing() { return this._isResizing(); }
  protected resizeLineLeft() { return this._resizeLineLeft(); }

  private _normalizeWidth(width?: string | number): string | undefined {
    if (width === null || width === undefined || width === '') return undefined;
    const sWidth = String(width);
    return /^\d+$/.test(sWidth) ? `${sWidth}px` : sWidth;
  }

  protected normalizedColumns = computed(() => {
    const overrides = this._manualWidths();
    const pinOverrides = this._manualPinned();
    const order = this._manualOrder();
    const visibility = this._manualVisibility();

    const defs = this.columnDefs();
    let orderedDefs = [...defs];

    if (order) {
      orderedDefs.sort((a, b) => {
        const indexA = order.indexOf(a.field);
        const indexB = order.indexOf(b.field);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    const defaultColDef = this.defaultColDef() || {};

    return orderedDefs.map(col => {
      const mergedCol = {
        ...defaultColDef,
        ...col
      };
      const overrideWidth = overrides[mergedCol.field];
      const pinOverride = pinOverrides[mergedCol.field];
      const visibleOverride = visibility[mergedCol.field];
      const width = this._normalizeWidth(overrideWidth ?? mergedCol.width ?? mergedCol.minWidth);
      const flex = (overrideWidth ? undefined : mergedCol.flex) ?? (width ? undefined : 1);
      const pinned = pinOverride ? pinOverride.pinned : mergedCol.pinned;
      const pinAlign = pinOverride ? pinOverride.pinAlign : mergedCol.pinAlign;
      return {
        ...mergedCol,
        visible: visibleOverride ?? mergedCol.visible ?? true,
        width,
        flex,
        pinned,
        pinAlign: pinned && !pinAlign ? 'start' : pinAlign
      };
    });
  });

  protected isSortingEnabled = computed(() => {
    return this.normalizedColumns().some(col => col.sortable);
  });

  protected pinnedLeftColumns = computed(() => this.normalizedColumns().filter(c => c.visible && c.pinned && c.pinAlign === 'start'));
  protected pinnedRightColumns = computed(() => this.normalizedColumns().filter(c => c.visible && c.pinned && c.pinAlign === 'end'));
  protected centerColumns = computed(() => this.normalizedColumns().filter(c => c.visible && !c.pinned));

  protected leftPinnedWidth = computed(() => {
    let width = 0;
    if (this.withSelection()) {
      width += this.selectionWidth();
    }
    width += this.pinnedLeftColumns().reduce((acc, col) => acc + (col.width ? parseInt(col.width, 10) : (col.flex ? 150 : 0)), 0);
    return width;
  });

  protected leftPinnedWidthStyles = computed(() => {
    return {
      'width.px': this.leftPinnedWidth(),
      'min-width.px': this.leftPinnedWidth()
    };
  });

  protected rightPinnedWidth = computed(() => {
    let width = 0;
    width += this.pinnedRightColumns().reduce((acc, col) => acc + (col.width ? parseInt(col.width, 10) : (col.flex ? 150 : 0)), 0);
    if (this.actionBarTemplateRef) width += this.actionBarWidth();
    return width;
  });

  protected rightPinnedWidthStyles = computed(() => {
    return {
      'width.px': this.rightPinnedWidth(),
      'min-width.px': this.rightPinnedWidth()
    };
  });

  protected centerWidth = computed(() => {
    const totalFixed = this.centerColumns().reduce((acc, col) => acc + (col.width ? parseInt(col.width, 10) : 0), 0);
    const hasFlex = this.centerColumns().some(c => !!c.flex);
    const availableWidth = this._viewportWidth();
    if (hasFlex) {
      const isBrowser = this.isBrowser();
      // Ensure we have at least some width for flex columns, and handle initial zero viewportWidth
      if (availableWidth === 0 && !isBrowser) {
        // In SSR, we don't know the viewport width, but we want flex columns to expand.
        // Returning totalFixed might cause the center to collapse if all columns are flex.
        return '100%' as any;
      }
      return Math.max(totalFixed, availableWidth, 300);
    }
    return Math.max(totalFixed, availableWidth);
  });

  protected onColumnResizeStart(event: MouseEvent, col: any) {
    if (!this.isBrowser() || !col?.resizable || event.button !== 0 || this._isResizing()) return;
    event.preventDefault();
    event.stopPropagation();

    // Determine initial width from DOM if not fixed yet
    const target = event.currentTarget as HTMLElement;
    const cell = target.closest('.header-cell') as HTMLElement | null;
    const startWidth = (col?.width ? parseInt(col.width, 10) : (cell ? cell.getBoundingClientRect().width : 0)) || 0;

    // Before starting resize — freeze widths of all columns to the left within the same section
    try {
      const overrides = { ...this._manualWidths() };
      const gridRoot = this._elRef.nativeElement.querySelector('.grid-root') as HTMLElement | null;

      const leftCols = this.pinnedLeftColumns();
      const centerCols = this.centerColumns();
      const rightCols = this.pinnedRightColumns();

      const byField = (arr: any[]) => arr.findIndex(c => c.field === col.field);
      const leftIdx = byField(leftCols);
      const centerIdx = byField(centerCols);
      const rightIdx = byField(rightCols);

      const freezeAll = (cols: any[], containerSelector: string, extraOffset = 0) => {
        const container = gridRoot?.querySelector(containerSelector) as HTMLElement | null;
        if (!container) return;
        const cells = Array.from(container.querySelectorAll(':scope .header-cell')) as HTMLElement[];
        for (let i = 0; i < cols.length; i++) {
          const colDef = cols[i];
          if (!colDef) continue;
          if (!overrides[colDef.field]) {
            const domIndex = i + extraOffset;
            const cellEl = cells[domIndex];
            const w = cellEl ? Math.round(cellEl.getBoundingClientRect().width) : (colDef.width ? parseInt(colDef.width, 10) : undefined);
            if (w && w > 0) {
              overrides[colDef.field] = `${w}px`;
            }
          }
        }
      };

      const extraLeft = this.withSelection() ? 1 : 0;
      freezeAll(leftCols, '.grid-header-left .header-inner', extraLeft);
      freezeAll(centerCols, '.grid-header-center .header-inner');
      freezeAll(rightCols, '.grid-header-right .header-inner');

      this._manualWidths.set(overrides);
    } catch {
      // best-effort freezing; ignore errors and continue
    }

    let nextCol: any = null;
    let nextColStartWidth = 0;
    try {
      const leftCols = this.pinnedLeftColumns();
      const centerCols = this.centerColumns();
      const rightCols = this.pinnedRightColumns();

      const byField = (arr: any[]) => arr.findIndex(c => c.field === col.field);
      const leftIdx = byField(leftCols);
      const centerIdx = byField(centerCols);
      const rightIdx = byField(rightCols);

      const findNextInfo = (cols: any[], idx: number, containerSelector: string, extraOffset = 0) => {
        if (idx < 0 || idx >= cols.length - 1) return null;
        const next = cols[idx + 1];
        const gridRoot = this._elRef.nativeElement.querySelector('.grid-root') as HTMLElement | null;
        const container = gridRoot?.querySelector(containerSelector) as HTMLElement | null;
        const cells = container ? Array.from(container.querySelectorAll(':scope .header-cell')) as HTMLElement[] : [];
        const domIndex = idx + 1 + extraOffset;
        const cellEl = cells[domIndex];
        const width = cellEl ? Math.round(cellEl.getBoundingClientRect().width) : (next.width ? parseInt(next.width, 10) : 0);
        return { col: next, width };
      };

      let nextInfo: any = null;
      if (leftIdx >= 0) {
        nextInfo = findNextInfo(leftCols, leftIdx, '.grid-header-left .header-inner', this.withSelection() ? 1 : 0);
      } else if (rightIdx >= 0) {
        nextInfo = findNextInfo(rightCols, rightIdx, '.grid-header-right .header-inner');
      }

      if (nextInfo) {
        nextCol = nextInfo.col;
        nextColStartWidth = nextInfo.width;
      }
    } catch { }

    const gridRoot = this._elRef.nativeElement.querySelector('.grid-root') as HTMLElement;
    const hostRect = gridRoot.getBoundingClientRect();
    const handleRect = (target as HTMLElement).getBoundingClientRect();
    const borderLeft = gridRoot.clientLeft || 0;
    const scrollbarArea = this._scrollbarArea();
    const initialScrollLeft = (!col.pinned && scrollbarArea) ? scrollbarArea.scrollableContentRef().nativeElement.scrollLeft : 0;

    const initialManualWidths = { ...this._manualWidths() };
    this._resizeStartX = event.clientX;
    this._resizeStartWidth = startWidth;
    this._resizeColField = col?.field ?? null;
    this._resizeLineLeft.set(handleRect.right - hostRect.left - borderLeft);
    this._isResizing.set(true);

    const rightPinnedWidth = this.rightPinnedWidth();
    const maxLineLeft = hostRect.width - borderLeft - rightPinnedWidth;
    const leftPinnedWidth = this.leftPinnedWidth();
    const minLineLeft = leftPinnedWidth;

    let moved = false;
    const colStartInHost = (handleRect.right - this._resizeStartWidth) - hostRect.left - borderLeft + initialScrollLeft;

    this._ngZone.runOutsideAngular(() => {
      const mouseMove$ = fromEvent<MouseEvent>(this._doc, 'mousemove', { capture: true });
      const mouseUp$ = fromEvent<MouseEvent>(this._doc, 'mouseup', { capture: true });
      const blur$ = fromEvent<FocusEvent>(window, 'blur');
      const dragStart$ = fromEvent<DragEvent>(window, 'dragstart');
      const selectStart$ = fromEvent<Event>(window, 'selectstart');

      const stopResize$ = new Subject<void>();

      // Prevent native drag and selection
      dragStart$.pipe(takeUntil(stopResize$)).subscribe(e => e.preventDefault());
      selectStart$.pipe(takeUntil(stopResize$)).subscribe(e => e.preventDefault());

      // Fix cursor for the whole document and block interactions
      const originalCursor = this._doc.body.style.cursor;
      this._doc.body.style.cursor = 'col-resize';
      this._doc.body.style.userSelect = 'none';
      const overlay = this._doc.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.zIndex = '9999';
      overlay.style.cursor = 'col-resize';
      this._doc.body.appendChild(overlay);

      const endResize = () => {
        stopResize$.next();
        stopResize$.complete();
        this._doc.body.style.cursor = originalCursor;
        this._doc.body.style.userSelect = '';
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }

        if (moved) {
          // More aggressive click suppression
          const clickSub = fromEvent<MouseEvent>(this._doc, 'click', { capture: true })
            .pipe(
              takeUntil(timer(50)),
              take(1)
            )
            .subscribe(clickEvent => {
              clickEvent.stopImmediatePropagation();
              clickEvent.preventDefault();
            });
        }

        this._ngZone.run(() => {
          this._isResizing.set(false);

          if (!moved) {
            this._manualWidths.set(initialManualWidths);
          } else {
            // Restore flex for columns that were not manually resized but were frozen
            const finalManualWidths = { ...this._manualWidths() };
            const currentFields = new Set([this._resizeColField, nextCol?.field].filter(Boolean));

            for (const field of Object.keys(finalManualWidths)) {
              if (!currentFields.has(field) && !initialManualWidths[field]) {
                delete finalManualWidths[field];
              }
            }
            this._manualWidths.set(finalManualWidths);
          }

          this._resizeColField = null;
        });
      };

      merge(mouseUp$, blur$).pipe(
        take(1)
      ).subscribe(e => {
        if (e instanceof MouseEvent) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
        endResize();
      });

      mouseMove$.pipe(
        takeUntil(stopResize$)
      ).subscribe(e => {
        if (!this._isResizing()) return;

        const dx = e.clientX - this._resizeStartX;
        if (Math.abs(dx) > 2) moved = true;

        const minWidthVal = col.minWidth !== undefined ? parseInt(col.minWidth, 10) : this.minColumnWidth();
        const maxWidthVal = col.maxWidth !== undefined ? parseInt(col.maxWidth, 10) : Infinity;

        // 1. Initial width based on mouse movement
        let newWidth = Math.round(this._resizeStartWidth + dx);

        // 2. Constraints for the column itself
        newWidth = Math.max(minWidthVal, Math.min(maxWidthVal, newWidth));

        // 3. Constraint by next column (if exists, e.g. in pinned sections)
        if (nextCol) {
          const nextMinWidth = nextCol.minWidth !== undefined ? parseInt(nextCol.minWidth, 10) : this.minColumnWidth();
          const maxPossibleWidth = (this._resizeStartWidth + nextColStartWidth) - nextMinWidth;
          if (newWidth > maxPossibleWidth) {
            newWidth = maxPossibleWidth;
          }
        }

        // 4. Final check on newWidth
        newWidth = Math.max(minWidthVal, newWidth);

        const isCenterCol = !col.pinned;
        const isLeftPinned = col.pinned && col.pinAlign !== 'end';
        const isRightPinned = col.pinned && col.pinAlign === 'end';

        this._ngZone.run(() => {
          // Update line position with latest scroll
          const currentScrollLeft = (!col.pinned && scrollbarArea) ? scrollbarArea.scrollableContentRef().nativeElement.scrollLeft : 0;
          let lineLeft = colStartInHost + newWidth - (col.pinned ? 0 : currentScrollLeft);

          const hostWidth = hostRect.width - borderLeft;
          // Visual clamping: stop the line at viewport/pinned boundaries
          if (isCenterCol) {
            lineLeft = Math.max(minLineLeft, Math.min(maxLineLeft, lineLeft));
          } else if (isLeftPinned) {
            lineLeft = Math.max(0, Math.min(maxLineLeft, lineLeft));
          } else if (isRightPinned) {
            lineLeft = Math.max(minLineLeft, Math.min(hostWidth, lineLeft));
          }

          this._resizeLineLeft.set(lineLeft);

          if (this._resizeColField) {
            const map = { ...this._manualWidths() };
            map[this._resizeColField] = `${newWidth}px`;

            // If we have a next column, it gets squeezed/expanded
            if (nextCol) {
              const currentNextWidth = Math.max(
                0,
                nextColStartWidth - (newWidth - this._resizeStartWidth)
              );
              map[nextCol.field] = `${currentNextWidth}px`;
            }

            this._manualWidths.set(map);
          }
        });
      });
    });
  }

  protected effectiveDataLength = computed(() => {
    // depend on data source render changes
    this._dsRenderTick();
    const dataSource = this.dataSource();
    // Use filteredData because it contains all items that passed filtering
    // and is what we should base pagination on.
    const totalDataLength = (this.rowModelType() === 'serverSide' ? dataSource.data : dataSource.filteredData)?.length || 0;
    const pSize = this.pageSize();
    const pIndex = this.pageIndex();

    if (this.rowModelType() === 'serverSide') {
      return totalDataLength;
    }

    if (this.withPagination()) {
      const start = pIndex * pSize;
      const end = Math.min(start + pSize, totalDataLength);
      return Math.max(0, end - start);
    }

    return totalDataLength;
  });

  protected effectivePaginatorLength = computed(() => {
    this._dsRenderTick();
    if (this.rowModelType() === 'serverSide') {
      return this._serverSideRowCount() || 0;
    }
    // Since we now manage pagination ourselves and don't set dataSource.paginator,
    // we should use the length of filtered data for the paginator.
    const ds = this.dataSource();
    return ds.filteredData?.length || 0;
  });

  protected totalHeight = computed(() => {
    return this.effectiveDataLength() * this.rowHeight();
  });

  protected visibleRange = computed(() => {
    // We still use signals here for parts that should trigger re-computation
    // like dataSource changes, but we access _scrollTop and _viewportHeight
    // which are updated manually.
    const top = this._scrollTop();
    const height = this._viewportHeight();
    const rowHeight = this.rowHeight();
    const buffer = this.bufferRows();
    const dataSource = this.dataSource();
    const dataLength = this.effectiveDataLength();

    let start = Math.floor(top / rowHeight) - buffer;
    let end = Math.ceil((top + height) / rowHeight) + buffer;

    start = Math.max(0, start);
    end = Math.min(dataLength, end);

    return { start, end };
  });

  protected visibleRows = computed(() => {
    // depend on data source render changes
    this._dsRenderTick();
    this.columnDefs(); // depend on columns
    this.data(); // depend on data
    this.loaded(); // depend on loaded state to ensure re-calculation after loading
    const pIndex = this.pageIndex();
    const pSize = this.pageSize();
    const { start, end } = this.visibleRange();
    const dataSource = this.dataSource();

    let data: T[];
    if (this.rowModelType() === 'serverSide') {
      data = dataSource.data;
    } else if (this.withPagination()) {
      data = dataSource.sortedData.slice(pIndex * pSize, (pIndex + 1) * pSize);
    } else {
      data = dataSource.sortedData;
    }

    // For serverSide, if we are loading but have some data already, we might want to keep it or show a loader.
    // The current logic in noFilteredResults handles the switch between table and empty state.
    // We only clear rows here if we are NOT in serverSide and loading, or if we want to force empty.
    if (this.rowModelType() !== 'serverSide' && (this._isLoading() || this._isFiltering()) && data.length === 0) {
      data = [];
    }

    return data.slice(start, end).map((item, index) => ({
      item,
      key: this.getRowId()?.(item) ?? item,
      index: start + index,
      top: (start + index) * this.rowHeight(),
      isLast: (start + index) === data.length - 1
    }));
  });

  displayedColumns = computed((): string[] => {
    const displayedColumns = this
      .normalizedColumns()
      .filter(colDef => colDef.visible)
      .map(colDef => colDef.field);

    if (this.withSelection()) {
      displayedColumns.unshift('selection');
    }

    if (this.actionBarTemplateRef) {
      displayedColumns.push('__actionBar');
    }

    return [...displayedColumns];
  });

  protected isSelectionSticky = computed(() => {
    if (!this.withSelection()) {
      return false;
    }
    return this.normalizedColumns().some(col => col.pinned && (col.pinAlign === 'start' || !col.pinAlign));
  });

  protected hasHorizontalScroll = computed(() => {
    return this.centerWidth() > this._viewportWidth() + 1;
  });

  protected dataSource = computed(() => {
    return this._dataSource;
  });

  private _syncEffect = effect(() => {
    const data = this.data();
    const search = this.search().trim().toLowerCase();
    const filters = this.normalizedFilters();
    const rowModelType = this.rowModelType();
    const refreshTriggerValue = this._refreshTrigger();
    untracked(() => this.beginRowModel(rowModelType));
    if (rowModelType === 'serverSide') {
      return;
    }
    untracked(() => {
      this._dataSource.data = data.filter(row => Object.entries(filters).every(([field, filter]) => matchesDataViewFilter(this.getNestedValue(row, field), filter)));
      if (rowModelType === 'clientSide') {
        this._dataSource.filter = search;
      }
      if (refreshTriggerValue > 0) {
        this.refreshEnd.emit();
      } else {
        this.loadEnd.emit();
      }
    });
  });

  private _loadDataEffect = effect(() => {
    const datasource = this.datasource();
    if (!datasource || this.rowModelType() !== 'serverSide' || this._isDestroyed) {
      untracked(() => { this.cancelPendingRequest(); this._internalLoading.set(false); this._lastRequestKey = null; });
      return;
    }

    if (datasource !== this._lastDatasource) { this._lastDatasource = datasource; this._lastRequestKey = null; }
    const pIndex = this.pageIndex();
    const pSize = this.pageSize();
    const search = this._debouncedSearch()?.trim() || '';
    const columnFilters = this.normalizedFilters();

    // Capture sort params outside untracked but avoid triggering when sort is null due to @if toggling
    const sort = this.sortState();
    const sortActive = sort.active;
    const sortDirection = sort.direction;
    const sortModel = sortActive ? [{ colId: sortActive, sort: (sortDirection as any) || '' }] : [];

    const refreshTriggerValue = this._refreshTrigger();

    // Build a stable request key to avoid refetch loops when the view toggles (e.g. empty state removes ngsSort)
    const requestKey = JSON.stringify([pIndex, pSize, sortModel, search, columnFilters, refreshTriggerValue]);
    if (this._lastRequestKey === requestKey) {
      return; // no meaningful params change — skip triggering a new request
    }

    // Special case: if sort was active and now is undefined because component was removed from DOM,
    // but we ARE loading or in a state where we expect it to come back, we might want to wait.
    // However, the requestKey should handle it. If sortActive becomes undefined, requestKey changes.

    const previousQuery = this._lastRequestKey ? JSON.parse(this._lastRequestKey) : null;
    const isFilterRequest = previousQuery && (previousQuery[3] !== search || JSON.stringify(previousQuery[4]) !== JSON.stringify(columnFilters));
    const isSortRequest = previousQuery && JSON.stringify(previousQuery[2]) !== JSON.stringify(sortModel);
    this._lastRequestKey = requestKey;

    untracked(() => {
      this.cancelPendingRequest();
      const currentRequestId = ++this._requestId;
      const controller = new AbortController();
      let settled = false;
      let dispose: void | (() => void) | { unsubscribe(): void };
      this._pendingRequestCleanup = () => {
        controller.abort();
        if (typeof dispose === 'function') dispose(); else if (dispose && typeof dispose.unsubscribe === 'function') dispose.unsubscribe();
      };
      if (isFilterRequest) {
        this._isFiltering.set(true);
      }
      if (isSortRequest) {
        this._isSorting.set(true);
      }
      this._internalLoading.set(true);
      this.error.set(null);
      const params: DataViewGetRowsParams = {
        signal: controller.signal,
        columnFilters,
        startRow: pIndex * pSize,
        endRow: (pIndex + 1) * pSize,
        page: pIndex,
        pageSize: pSize,
        sortModel,
        filterModel: search,
        successCallback: (rows: any[], lastRow?: number) => {
          this._ngZone.run(() => {
            if (settled || controller.signal.aborted || this._isDestroyed || currentRequestId !== this._requestId) return;
            settled = true;
            this._dataSource.data = rows;
            if (lastRow !== undefined) {
              this._serverCountKnown.set(true);
              const total = Math.max(0, lastRow);
              this._serverSideRowCount.set(total);
              const lastPage = Math.max(0, Math.ceil(total / Math.max(1, pSize)) - 1);
              if (pIndex > lastPage) { this.pageIndex.set(lastPage); this.resetScroll(); }

              // Update _hasDataOnServer if we have any rows OR if we are doing a clean request (no filters)
              if (lastRow > 0) {
                this._hasDataOnServer.set(true);
              } else if (!search && !Object.keys(columnFilters).length) {
                this._hasDataOnServer.set(false);
              }
            } else {
              // If lastRow is not provided, we can only infer _hasDataOnServer if we actually got rows
              if (rows.length > 0) {
                this._hasDataOnServer.set(true);
              } else if (!search && !Object.keys(columnFilters).length) {
                this._hasDataOnServer.set(false);
              }
            }
            this.loaded.set(true);
            this._internalLoading.set(false);
            this._isFiltering.set(false);
            this._isSorting.set(false);
            if (refreshTriggerValue > 0) {
              this.refreshEnd.emit();
            } else {
              this.loadEnd.emit();
            }
            this._cdr.markForCheck();
          });
        },
        failCallback: (error?: unknown) => {
          this._ngZone.run(() => {
            if (settled || controller.signal.aborted || this._isDestroyed || currentRequestId !== this._requestId) return;
            settled = true;
            this.error.set(error instanceof Error ? error.message : typeof error === 'string' ? error : 'Could not load records. Please try again.');
            this.loadError.emit(error);
            this.loaded.set(true);
            this._internalLoading.set(false);
            this._isFiltering.set(false);
            this._isSorting.set(false);
            if (refreshTriggerValue > 0) {
              this.refreshEnd.emit();
            } else {
              this.loadEnd.emit();
            }
            this._cdr.markForCheck();
          });
        }
      };
      this._ngZone.runOutsideAngular(() => {
        try { dispose = datasource.getItems(params); } catch (error) { params.failCallback(error); }
      });
    });
  });

  private _dsRenderTick = signal(0);
  private _connectEffect = effect((onCleanup) => {
    const ds = this.dataSource();
    const sub = ds.connect().subscribe(() => {
      // bump a signal to re-compute derived values depending on sortedData
      this._dsRenderTick.update(v => v + 1);
      untracked(() => this._cdr.markForCheck());
    });
    onCleanup(() => sub.unsubscribe());
  });

  cellRenderers = input<DataViewCellRendererDef[]>([]);
  loading = input(false, {
    transform: booleanAttribute
  });
  hoverRows = input(false, {
    transform: booleanAttribute
  });
  search = model<string>('');
  private _debouncedSearch = signal('');

  private _debounceSearchEffect = effect((onCleanup) => {
    const search = this.search();
    if (this.rowModelType() === 'clientSide') {
      this._isFiltering.set(true);
    }
    const timeout = setTimeout(() => {
      untracked(() => {
        this._debouncedSearch.set(search);
        if (this.rowModelType() === 'clientSide') {
          this._isFiltering.set(false);
        }
      });
    }, 300);
    onCleanup(() => clearTimeout(timeout));
  });
  emptyIcon = input('fluent:document-search-24-regular');
  emptyText = input('There are no data to display');
  emptyFilterResultsIcon = input('fluent:search-info-24-regular');
  emptyFilterResultsText = input('No data matching the filter "{{ search }}"');

  protected interpolatedEmptyFilterResultsText = computed(() => {
    return this.emptyFilterResultsText().replace('{{ search }}', this.search());
  });

  protected _isLoading = computed(() => (this.loading() || this._internalLoading() || this._isFiltering()));
  protected shouldRenderGrid = computed(() => this.loaded() || this._isLoading());

  protected injector = inject(Injector);
  protected selection = new DataViewSelection<T>(row => this.getRowId()?.(row) ?? row);
  private _selectionTick = signal(0);
  private _selectedScope: DataViewSelectionScope = 'filtered';
  private _selectedSearch = '';
  private _selectedFilters: DataViewFilterModel = {};
  protected cellRenderersMap = new Map<string, any>();
  protected loadingCellRenderers = signal(false);

  readonly rowSelectionChanged = output<DataViewRowSelectionEvent<T>>();
  readonly selectionChanged = output<T[]>();
  readonly selectionStateChanged = output<DataViewSelectionState<T>>();
  readonly allRowsSelectionChanged = output<boolean>();
  readonly sortChange = output<Sort>();
  readonly loadEnd = output<void>();
  readonly refreshEnd = output<void>();

  get api(): DataViewAPI<T> {
    return {
      search: (value: string): void => {
        this.search.set(value);
      },
      selectAll: (scope?: DataViewSelectionScope): void => {
        this.selectAll(scope);
      },
      unselectAll: (): void => {
        this.unselectAll();
      },
      selectOne: (row: T): void => {
        this.selectOne(row);
      },
      isSelected: (row: T): boolean => {
        return this.isSelected(row);
      },
      hasSelected: (): boolean => {
        return this.hasSelected();
      },
      refresh: (): void => {
        this.refresh();
      },
      getSnapshot: (): DataViewState[] => {
        return this.getSnapshot();
      },
      getSelection: () => this.getSelection(),
      setColumnFilter: (field, filter) => this.setColumnFilter(field, filter),
      clearFilters: () => this.clearFilters(),
      getState: () => this.getState(), setState: state => this.setState(state),
      saveView: (name, id) => this.saveView(name, id), applyView: id => this.applyView(id),
      renameView: (id, name) => this.renameView(id, name), deleteView: id => this.deleteView(id)
    }
  }

  refresh(): void {
    this._lastRequestKey = null;
    this._refreshTrigger.update(v => v + 1);
  }

  get noFilteredResults(): boolean {
    const dataSource = this.dataSource();
    const isClientSide = this.rowModelType() === 'clientSide';
    const rawDataLength = isClientSide ? this.data().length : (dataSource.data?.length ?? 0);
    const currentlyEmpty = rawDataLength === 0;

    // During client-side filtering, immediately show empty state if filtered data is empty,
    // to avoid a short flash of an empty table before debounce takes effect.
    if (isClientSide && (this._isFiltering() || this.hasFilterValue)) {
      const filteredEmpty = (dataSource.filteredData?.length ?? 0) === 0;
      if (filteredEmpty) {
        return true;
      }
    }

    if (this._isLoading() || this.loadingCellRenderers()) {
      // For serverSide, while loading the first time (when we don't know yet if we have data),
      // we show the table (potentially for skeletons) instead of empty state.
      if (this.rowModelType() === 'serverSide' && this._hasDataOnServer() === undefined) {
        return false;
      }

      // If we are already in an empty state (data is empty and no previous data was confirmed on server),
      // keep showing it during loading/filtering to avoid flashing the table headers/structure.
      if (currentlyEmpty && !this.isBrowser()) {
        return true;
      }
      return false;
    }

    if (this.rowModelType() === 'serverSide' && this._hasDataOnServer() === undefined) {
      return false;
    }

    return this.isNoData || this.isNoResults;
  }

  protected get isNoResults(): boolean {
    if (this.error()) return false;
    const dataSource = this.dataSource();
    const isClientSide = this.rowModelType() === 'clientSide';
    const rawDataLength = isClientSide ? this.data().length : (dataSource.data?.length ?? 0);
    const dataLength = dataSource.data?.length ?? 0;
    const filteredDataLength = dataSource.filteredData?.length ?? 0;

    if (isClientSide) {
      return filteredDataLength === 0 && (this.hasFilterValue || this._isSorting());
    }

    if (this.rowModelType() === 'serverSide') {
      const loadingTransition = this._isLoading() && this._hasDataOnServer() === true;
      // If we have 0 data, but loading is in progress (and we don't know if there will be data), we show skeletons, so isNoResults should be false
      if (this._isLoading() && this._hasDataOnServer() === undefined) {
        return false;
      }
      return dataLength === 0 && (this.hasFilterValue || this._isSorting() || loadingTransition) && this._hasDataOnServer() !== false;
    }

    return false;
  }

  protected get isNoData(): boolean {
    if (this.error()) return false;
    const dataSource = this.dataSource();
    const isClientSide = this.rowModelType() === 'clientSide';
    const rawDataLength = isClientSide ? this.data().length : (dataSource.data?.length ?? 0);
    const dataLength = dataSource.data?.length ?? 0;

    if (isClientSide) {
      return rawDataLength === 0 && !this.hasFilterValue && !this._isSorting();
    }

    if (this.rowModelType() === 'serverSide') {
      if (this._isLoading() && this._hasDataOnServer() === undefined) {
        return false;
      }
      return dataLength === 0 && !this.hasFilterValue && !this._isSorting() && this._hasDataOnServer() === false;
    }

    return false;
  }

  get actionBarTemplateRef(): TemplateRef<any> | undefined {
    return this._actionBarRef()?.templateRef;
  }

  protected actionBarWidth = computed(() => {
    return this._actionBarComp()?.width() ?? this._actionBarRef()?.width() ?? 100;
  });

  protected get emptyTemplateRef(): TemplateRef<any> {
    return this._emptyDataRef()?.templateRef as TemplateRef<any>;
  }

  protected get emptyFilterResultsTemplateRef(): TemplateRef<any> {
    return this._emptyFilterResults()?.templateRef as TemplateRef<any>;
  }

  protected get hasFilterValue(): boolean {
    return !!this.search().trim() || Object.keys(this.normalizedFilters()).length > 0;
  }

  getNestedValue(item: any, path: string): any {
    if (!item || !path) {
      return null;
    }

    if (!path.includes('.')) {
      return item[path];
    }

    return path.split('.').reduce((obj, key) => obj?.[key], item);
  }

  constructor() {
    effect(() => {
      const length = this.effectiveDataLength(); const columns = this.logicalColumns().length;
      untracked(() => {
        const active = this.activeCell(); const row = Math.max(0, Math.min(active.row, length - 1));
        const column = Math.max(0, Math.min(active.column, columns - 1));
        if (row !== active.row || column !== active.column) this.activeCell.set({ row, column });
      });
    });
    let lastState = '';
    effect(() => {
      const state = this.getState(); const key = JSON.stringify(state);
      if (key !== lastState) { lastState = key; untracked(() => this.stateChanged.emit(state)); }
    });
    let loadedStorageKey: string | null = null;
    effect(() => {
      const key = this.viewStorageKey(); const browser = this.isBrowser();
      if (!browser || key === loadedStorageKey) return;
      loadedStorageKey = key;
      untracked(() => {
        this._storageReady.set(false); this.viewStorageError.set(null);
        if (!key) return;
        try {
          const raw = this.viewStorage()?.getItem(key);
          if (raw) {
            const payload = JSON.parse(raw);
            if (payload.version !== 1) throw new Error('Unsupported saved view format');
            this.savedViews.set(normalizeDataViewSavedViews(payload.views, this.normalizedColumns()));
            if (typeof payload.activeViewId === 'string' && this.savedViews().some(v => v.id === payload.activeViewId)) this.applyView(payload.activeViewId);
          }
        } catch (error) { this.viewStorageError.set(error instanceof Error ? error.message : 'Could not restore saved views'); }
        this._storageReady.set(true);
      });
    });
    effect(() => {
      const key = this.viewStorageKey(); const ready = this._storageReady();
      const views = this.savedViews(); const activeViewId = this.activeViewId();
      if (!key || !ready) return;
      untracked(() => {
        try { this.viewStorage()?.setItem(key, JSON.stringify({ version: 1, views, activeViewId })); }
        catch (error) { this.viewStorageError.set(error instanceof Error ? error.message : 'Could not save views'); }
      });
    });
    let previousSearch: string | undefined;
    effect(() => {
      const search = JSON.stringify([this.search().trim(), this.normalizedFilters()]);
      if (previousSearch !== undefined && previousSearch !== search) {
        untracked(() => {
          this.pageIndex.set(0); this.resetScroll();
          if (this.selection.allMatching && this._selectedScope === 'filtered') this.unselectAll();
        });
      }
      previousSearch = search;
    });
    effect(() => {
      this._dsRenderTick();
      const length = this.effectivePaginatorLength();
      const size = Math.max(1, this.pageSize());
      const index = this.pageIndex();
      if (this.rowModelType() === 'clientSide' && this.withPagination()) {
        const lastPage = Math.max(0, Math.ceil(length / size) - 1);
        if (index > lastPage || index < 0) untracked(() => {
          this.pageIndex.set(Math.max(0, Math.min(index, lastPage))); this.resetScroll();
        });
      }
    });
    let previousRowId = this.getRowId();
    effect(() => {
      const key = this.getRowId();
      const mode = this.rowSelection();
      this._dsRenderTick();
      const rows = this.rowModelType() === 'clientSide' ? this.data() : this.dataSource().data;
      untracked(() => {
        let changed = false;
        if (key !== previousRowId) { this.selection.clear(); changed = true; previousRowId = key; }
        if (mode === 'single' && (this.selection.allMatching || this.selection.selected.length > 1)) {
          const first = this.selection.selected[0]; this.selection.clear(); if (first) this.selection.select(first); changed = true;
        }
        if (this.selection.reconcile(rows, this.rowModelType() === 'clientSide') || changed) this.emitSelection();
      });
    });

    this._destroyRef.onDestroy(() => {
      this._isDestroyed = true;
      this.cancelPendingRequest();
    });

    // Reactively bind scroll-sync and ResizeObserver to the current ScrollbarArea,
    // to work correctly with conditional rendering (empty state / table)
    effect((onCleanup) => {
      const scrollbarArea = this._scrollbarArea();
      const isBrowser = this.isBrowser();
      if (!scrollbarArea || !isBrowser || this._isDestroyed) {
        return;
      }

      const centerEl = scrollbarArea.scrollableContentRef().nativeElement as HTMLElement;

      // Set initial viewport dimensions to avoid 0 width after returning from empty state
      const rect = centerEl.getBoundingClientRect();
      this._viewportHeight.set(rect.height);
      this._viewportWidth.set(rect.width);

      // Attach scroll-sync
      const scrollHandler = () => {
        if (this._isDestroyed) return;
        this._syncScrolls(centerEl);
      };

      this._ngZone.runOutsideAngular(() => {
        centerEl.addEventListener('scroll', scrollHandler, { passive: true });
      });

      // Bind ResizeObserver with safe layout
      const observer = new ResizeObserver((entries) => {
        this._ngZone.runOutsideAngular(() => {
          requestAnimationFrame(() => {
            if (this._isDestroyed) return;
            this._ngZone.run(() => {
              try {
                for (const entry of entries) {
                  const { height, width } = entry.contentRect;
                  // Use 1px threshold to prevent infinite loops due to subpixels
                  if (Math.abs(this._viewportHeight() - height) > 1) {
                    this._viewportHeight.set(height);
                  }
                  if (Math.abs(this._viewportWidth() - width) > 1) {
                    this._viewportWidth.set(width);
                  }
                }
              } catch {
                // ignore, dimensions will be delivered on the next tick
              }
            });
          });
        });
      });
      observer.observe(centerEl);

      // Synchronize transforms immediately after rebinding
      this._lastScrollTop = centerEl.scrollTop;
      this._lastScrollLeft = centerEl.scrollLeft;
      this._syncTransforms();

      onCleanup(() => {
        try { centerEl.removeEventListener('scroll', scrollHandler as any); } catch {}
        try { observer.disconnect(); } catch {}
      });
    });

    effect(() => {
      const sort = this._ngsSort();
      const state = this.sortState();
      const dataSource = this.dataSource();
      if (sort && dataSource && !this._isDestroyed && this.rowModelType() !== 'serverSide') {
        untracked(() => {
          sort.active.set(state.active); sort.direction.set(state.direction);
          dataSource.sort = sort;
        });
      }
    });

    effect(() => {
      const active = this.paginator(); const length = this.effectivePaginatorLength();
      const index = this.pageIndex(); const size = this.pageSize();
      if (active && this.withPagination()) untracked(() => {
        active.length = length; active.pageIndex = index; active.pageSize = size;
      });
    });

    // Sync external paginator page events with internal page state when provided
    effect((onCleanup) => {
      const ext = this.paginator();
      if (ext) {
        const sub = ext.page.subscribe(event => this.onPageChange(event));
        onCleanup(() => sub.unsubscribe());
      }
    });

    effect(() => {
      this.dataSource().sortingDataAccessor = (item: any, property) => {
        const columnDef = this.columnDefs().find(colDef => colDef.field === property);

        if (columnDef) {
          if (columnDef.valueGetter) {
            return columnDef.valueGetter(this.getNestedValue(item, property));
          }
        }

        switch (property) {
          default: {
            return this.getNestedValue(item, property);
          }
        }
      };
    });

    effect(() => {
      // Force table to re-render when column definitions change
      // to avoid "Could not find column" errors when using signals
      this.columnDefs();
      this.displayedColumns();
      untracked(() => {
        this.table?.renderRows();
        // CdkTable uses _cacheColumnDefs internally, but it's private.
        // renderRows should trigger it if definitions changed.
      });
    });

    effect(() => {
      this.hoveredRowIndex();
      this._syncHoverState();
    });
  }

  ngOnDestroy() {
    this._isDestroyed = true;
    this.cancelPendingRequest();
    this._dataSource.disconnect();
  }

  ngOnInit() {
    this._initialFullState = this.getState();
    this._initialViewState.set(this.columnDefs().map(col => ({
      field: col.field,
      visible: col.visible ?? true,
      width: col.width,
      pinned: !!col.pinned,
      pinAlign: col.pinned ? col.pinAlign : undefined
    })));

    const snapshot = this.snapshot();
    if (snapshot) {
      this.applyState(snapshot);
    }

    if (this.rowModelType() !== 'serverSide') {
      this.loaded.set(true);
    }
    if (this.rowModelType() === 'serverSide' && this._dataSource.data.length === 0) {
      this._internalLoading.set(true);
    }

    if (this.cellRenderers().length === 0) {
      return;
    }

    this.loadingCellRenderers.set(true);
    const components = this.cellRenderers().map(cellRenderer => cellRenderer.component());
    Promise.all(components).then(components => {
      components.forEach((component: any, index: number) => {
        this.cellRenderersMap.set(this.cellRenderers()[index].cellRenderer, component)
      });
      this.loadingCellRenderers.set(false);
      this._cdr.detectChanges();
    }).catch(() => {
      this.loadingCellRenderers.set(false);
      this._cdr.detectChanges();
    });
  }

  ngAfterViewInit() {
    this.isBrowser.set(isPlatformBrowser(this._platformId));
    this._cdr.detectChanges();
  }

  private _syncScrolls(source: HTMLElement) {
    const scrollTop = source.scrollTop;
    const scrollLeft = source.scrollLeft;

    this._lastScrollTop = scrollTop;
    this._lastScrollLeft = scrollLeft;

    if (this._isDestroyed) return;

    this._syncTransforms();

    this._ngZone.run(() => {
      this._scheduleVirtualUpdate(scrollTop);
    });
  }

  private _scheduleVirtualUpdate(scrollTop: number): void {
    const delta = Math.abs(this._scrollTop() - scrollTop);
    const threshold = this.rowHeight() * (this.bufferRows() / 2);

    if (delta >= threshold || scrollTop === 0 || scrollTop + this._viewportHeight() >= this.totalHeight()) {
      this._scrollTop.set(scrollTop);
      this._syncTransforms();
    }
  }

  private _syncTransforms() {
    const scrollTop = this._lastScrollTop;
    const scrollLeft = this._lastScrollLeft;

    const headerCenterInner = this._headerCenterInner()?.nativeElement;
    if (headerCenterInner) {
      headerCenterInner.style.transform = `translate3d(${-scrollLeft}px, 0, 0)`;
    }

    const bodyLeftContent = this._bodyLeftContent()?.nativeElement;
    const bodyRightContent = this._bodyRightContent()?.nativeElement;
    const bodyCenterContent = this._bodyCenterContent()?.nativeElement;

    if (bodyLeftContent) {
      bodyLeftContent.style.transform = `translate3d(0, ${-scrollTop}px, 0)`;
    }
    if (bodyRightContent) {
      bodyRightContent.style.transform = `translate3d(0, ${-scrollTop}px, 0)`;
    }
    if (bodyCenterContent) {
      bodyCenterContent.style.transform = `translate3d(${-scrollLeft}px, ${-scrollTop}px, 0)`;
    }

    // Sync hovered row if needed
    this._syncHoverState();
  }

  private _syncHoverState() {
    // if (!isPlatformBrowser(this._platformId)) return;
    //
    // this._ngZone.runOutsideAngular(() => {
    //   const rows = Array.from(document.querySelectorAll('.ngs-data-view .grid-row'));
    //   const hoveredIndex = this.hoveredRowIndex();
    //   rows.forEach(row => {
    //     const indexAttr = row.getAttribute('data-row-index');
    //     if (indexAttr !== null) {
    //       const index = parseInt(indexAttr, 10);
    //       if (index === hoveredIndex) {
    //         row.classList.add('is-hovered');
    //       } else {
    //         row.classList.remove('is-hovered');
    //       }
    //     }
    //   });
    // });
  }

  get table(): Table<T> {
    return this._table() as Table<T>;
  }

  get ngsSort(): SortDirective {
    return this._ngsSort() as SortDirective;
  }

  hasCellRenderer(cellRenderer: string): boolean {
    return this.cellRenderersMap.has(cellRenderer);
  }

  getCellRenderer(cellRenderer: string): any {
    return this.cellRenderersMap.get(cellRenderer);
  }

  isAllSelected(): boolean {
    this._selectionTick();
    if (this.rowModelType() === 'serverSide' && this.selectionScope() !== 'page' && this.getRowId()) {
      return this.selection.allMatching && this.selection.excluded.size === 0;
    }
    const data = this.selectionRows(this.selectionScope());
    return data.length > 0 && data.every(row => this.selection.isSelected(row));
  }

  protected isPartiallySelected(): boolean {
    this._selectionTick();
    if (this.rowModelType() === 'serverSide' && this.selectionScope() !== 'page' && this.getRowId()) return this.hasSelected() && !this.isAllSelected();
    const rows = this.selectionRows(this.selectionScope());
    const selected = rows.filter(row => this.selection.isSelected(row)).length;
    return selected > 0 && selected < rows.length;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.unselectAll();
    } else {
      this.selectAll();
    }
  }

  rowSelectionToggle(event: CheckboxChange, row: T): void {
    if (event.checked) {
      if (this.rowSelection() === 'single') this.selection.clear();
      this.selection.select(row);
    } else {
      this.selection.deselect(row);
    }

    this.rowSelectionChanged.emit({
      source: 'checkbox',
      checkboxChange: event,
      row,
      checked: event.checked
    });

    this.emitSelection();
  }

  protected selectRowByClick(event: MouseEvent, row: T): void {
    if (!this.allowSingleRowSelectionByClick() || this._isInteractiveRowClick(event)) {
      return;
    }

    this.selectOne(row);
  }

  private _isInteractiveRowClick(event: MouseEvent): boolean {
    if (event.defaultPrevented) {
      return true;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return !!target.closest([
      'a',
      'button',
      'input',
      'select',
      'textarea',
      '[contenteditable="true"]',
      '[role="button"]',
      '[role="checkbox"]',
      '[role="menuitem"]',
      'ngs-checkbox',
      'ngs-menu',
      'ngs-data-view-action-bar',
    ].join(','));
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.resetScroll();
  }

  private resetScroll(): void {
    const scroller = this._scrollbarArea()?.scrollableContentRef().nativeElement;
    if (scroller) scroller.scrollTop = 0;
    this._scrollTop.set(0); this._lastScrollTop = 0; this._syncTransforms();
    this.activeCell.update(cell => ({ ...cell, row: 0 })); this._selectionAnchor = 0;
  }

  private cancelPendingRequest(): void {
    const cleanup = this._pendingRequestCleanup; this._pendingRequestCleanup = null; cleanup?.();
  }

  private beginRowModel(mode: DataViewRowModelType): void {
    if (mode === this._lastRowModelType) return;
    this._lastRowModelType = mode; this._lastRequestKey = null; this._requestId++;
    this.cancelPendingRequest();
    this._hasDataOnServer.set(undefined); this._serverCountKnown.set(false); this._serverSideRowCount.set(0);
    this.error.set(null); this._isFiltering.set(false); this._isSorting.set(false);
    this.loaded.set(mode === 'clientSide'); this._internalLoading.set(mode === 'serverSide');
    this._dataSource.sort = null; this._dataSource.filter = ''; this._dataSource.data = [];
    this.resetScroll();
  }

  protected sortColumn(col: DataViewColumnDef, direction: SortDirection): void {
    this.onSortChange({ active: col.field, direction });
  }

  getSnapshot(): DataViewState[] {
    return this.normalizedColumns().map(col => ({
      field: col.field,
      visible: col.visible ?? true,
      width: col.width,
      pinned: !!col.pinned,
      pinAlign: col.pinned ? col.pinAlign : undefined
    }));
  }

  applyState(state: DataViewState[]): void {
    if (!state || state.length === 0) return;

    const pinOverrides: Record<string, { pinned: boolean; pinAlign: DataViewPinAlign }> = {};
    const widthOverrides: Record<string, DataViewColumnDef['width']> = {};
    const visibility: Record<string, boolean> = {};
    this.columnDefs().forEach(col => {
      const colState = state.find(s => s.field === col.field);
      if (colState) {
        visibility[col.field] = colState.visible !== false;
        if (colState.width !== undefined) {
          widthOverrides[col.field] = colState.width;
        }
        pinOverrides[col.field] = {
          pinned: !!colState.pinned,
          pinAlign: colState.pinAlign
        };
      }
    });

    this._manualPinned.set(pinOverrides);
    this._manualWidths.set(widthOverrides);
    this._manualVisibility.set(visibility);
    this._manualOrder.set(state.map(c => c.field));
    this._cdr.markForCheck();
  }

  protected pinColumn(col: any, align: DataViewPinAlign | null): void {
    const pinOverrides = { ...this._manualPinned() };

    if (align === null) {
      pinOverrides[col.field] = { pinned: false, pinAlign: undefined };
    } else {
      pinOverrides[col.field] = { pinned: true, pinAlign: align };
    }
    this._manualPinned.set(pinOverrides);
    this._cdr.markForCheck();
  }

  protected autosizeColumn(col: DataViewColumnDef): void {
    const width = this._calculateColumnAutosize(col);
    if (width > 0) {
      const widths = { ...this._manualWidths() };
      widths[col.field] = `${width}px`;
      this._manualWidths.set(widths);
      this._cdr.markForCheck();
    }
  }

  protected autosizeAllColumns(): void {
    const widths = { ...this._manualWidths() };
    let changed = false;
    this.normalizedColumns().forEach(col => {
      if (col.visible) {
        const width = this._calculateColumnAutosize(col);
        if (width > 0) {
          widths[col.field] = `${width}px`;
          changed = true;
        }
      }
    });

    if (changed) {
      this._manualWidths.set(widths);
      this._cdr.markForCheck();
    }
  }

  private _calculateColumnAutosize(col: DataViewColumnDef): number {
    if (!isPlatformBrowser(this._platformId)) return 0;

    const gridRoot = this._elRef.nativeElement;
    const headerCells = Array.from(gridRoot.querySelectorAll(`.header-cell`)) as HTMLElement[];
    const targetHeaderCell = headerCells.find(cell => {
      const sortHeader = cell.querySelector('[ngs-sort-header]');
      return sortHeader?.getAttribute('ngs-sort-header') === col.field;
    });

    if (!targetHeaderCell) return 0;

    const headerContent = targetHeaderCell.querySelector('.grow') as HTMLElement;
    const headerWidth = (headerContent?.scrollWidth ?? 0)
      + 32 // padding-left/right
      + 32; // extra space for sort icon and menu button

    let maxContentWidth = headerWidth;
    const cells = Array.from(gridRoot.querySelectorAll<HTMLElement>('.cell')).filter(cell => cell.dataset['columnField'] === col.field).slice(0, 50);
    for (const cell of cells) {
      const content = cell.firstElementChild as HTMLElement | null;
      if (content) maxContentWidth = Math.max(maxContentWidth, content.scrollWidth + 32);
    }

    return Math.min(Math.max(maxContentWidth, 60), 500);
  }

  protected resetColumns(): void {
    const initialState = this._initialViewState();
    if (initialState.length > 0) {
      this.applyState(initialState);
    }

    this._manualWidths.set({});
    this._manualPinned.set({});
    this._manualOrder.set(null);
    this._manualVisibility.set({});
    this._cdr.markForCheck();
  }

  protected openColumnSettingsDialog(): void {
    const dialogRef = this._dialog.open<DataViewColumnSettingsDialog, any, ColumnSettingsDialogResult>(DataViewColumnSettingsDialog, {
      minWidth: '400px',
      data: {
        columns: this.normalizedColumns(),
      },
    });

    dialogRef.afterClosed().subscribe((result: ColumnSettingsDialogResult | undefined) => {
      if (result) {
        const newOrder = result.columns.map((c: any) => c.field);
        const newVisibility = { ...this._manualVisibility() };
        const newPinned = { ...this._manualPinned() };

        result.columns.forEach((c: any) => {
          newVisibility[c.field] = c.visible !== false;
          newPinned[c.field] = { pinned: !!c.pinned, pinAlign: c.pinAlign };
        });

        // Add back missing columns that were filtered out in dialog
        const currentOrder = this._manualOrder() || this.columnDefs().map(c => c.field);
        const resultFields = new Set(newOrder);
        const fullOrder = [...newOrder];

        currentOrder.forEach(field => {
          if (!resultFields.has(field)) {
            // Find where it should be inserted to keep relative order if possible,
            // but just appending is also a common strategy for "static" columns.
            // Let's try to maintain the original relative order.
            fullOrder.push(field);
          }
        });

        this._manualOrder.set(fullOrder);
        this._manualVisibility.set(newVisibility);
        this._manualPinned.set(newPinned);
        this._cdr.markForCheck();
      }
    });
  }

  protected onSortChange(event: Sort): void {
    this.sortState.set(event);
    this.pageIndex.set(0); this.resetScroll();
    if (this.rowModelType() !== 'serverSide') {
      this.dataSource().sort = this.ngsSort || null;
    }
    this.sortChange.emit(event);
  }

  private selectionRows(scope: DataViewSelectionScope): T[] {
    this._dsRenderTick();
    if (this.rowModelType() === 'serverSide') return this.dataSource().data;
    const rows = scope === 'all' ? this.data() : this.dataSource().sortedData;
    return scope === 'page' && this.withPagination()
      ? rows.slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()) : rows;
  }

  selectAll(scope: DataViewSelectionScope = this.selectionScope()): void {
    const data = this.selectionRows(scope);
    this._selectedScope = this.rowModelType() === 'serverSide' && !this.getRowId() ? 'page' : scope;
    this._selectedSearch = scope === 'all' ? '' : this.search().trim();
    this._selectedFilters = scope === 'all' ? {} : normalizeDataViewFilters(this.normalizedFilters());
    if (this.rowSelection() === 'single') {
      this.selection.clear(); if (data[0]) this.selection.select(data[0]);
    } else if (this.rowModelType() === 'serverSide' && scope !== 'page' && this.getRowId()) {
      this.selection.selectMatching(data);
    } else {
      this.selection.selectRows(data);
    }
    this.emitSelection();
    this.allRowsSelectionChanged.emit(true);
  }

  unselectAll(): void {
    this.selection.clear();
    this.emitSelection();
    this.allRowsSelectionChanged.emit(false);
  }

  selectOne(row: T): void {
    if (this.selection.selected.length === 1 && this.selection.isSelected(row)) {
      return;
    }

    this.selection.clear();
    this.selection.select(row);

    this.rowSelectionChanged.emit({
      source: 'row',
      row,
      checked: true
    });
    this.emitSelection();
  }

  isSelected(row: T): boolean {
    this._selectionTick();
    return this.selection.isSelected(row);
  }

  hasSelected(): boolean {
    this._selectionTick();
    return this.selection.hasValue();
  }

  getSelection(): DataViewSelectionState<T> {
    const isId = (value: unknown): value is DataViewRowId => typeof value === 'string' || typeof value === 'number';
    return { scope: this._selectedScope, allMatching: this.selection.allMatching,
      rowIds: this.selection.keys.filter(isId), excludedRowIds: [...this.selection.excluded].filter(isId),
      rows: this.selection.selected, search: this._selectedSearch, columnFilters: normalizeDataViewFilters(this._selectedFilters) };
  }

  private emitSelection(): void {
    this._selectionTick.update(value => value + 1);
    this.selectionChanged.emit(this.selection.selected);
    this.selectionStateChanged.emit(this.getSelection()); this._cdr.markForCheck();
  }

  getState(): DataViewViewState {
    return { version: 1, columns: this.getSnapshot(), sort: { ...this.sortState() },
      search: this.search(), columnFilters: normalizeDataViewFilters(this.normalizedFilters()), pageSize: this.pageSize() };
  }

  setState(value: DataViewViewState): void {
    const state = normalizeDataViewState(value, this.normalizedColumns());
    this.applyState(state.columns); this.sortState.set(state.sort); this.search.set(state.search);
    this.columnFilters.set(state.columnFilters); this.pageSize.set(state.pageSize); this.pageIndex.set(0); this.resetScroll();
  }

  private validateViewName(name: string, id?: string): string {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) throw new Error('View name must contain 1–100 characters');
    if (this.savedViews().some(view => view.id !== id && view.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) throw new Error('A view with this name already exists');
    return trimmed;
  }

  saveView(name: string, id?: string): DataViewSavedView {
    if (id && !this.savedViews().some(view => view.id === id)) throw new Error(`Unknown saved view: ${id}`);
    const view = { id: id ?? crypto.randomUUID(), name: this.validateViewName(name, id), state: this.getState() };
    this.savedViews.update(views => id ? views.map(item => item.id === id ? view : item) : [...views, view]);
    this._activeViewId.set(view.id); return view;
  }

  applyView(id: string | null): void {
    if (!id) {
      if (this._initialFullState) this.setState(this._initialFullState);
      this._activeViewId.set(null); this.viewApplied.emit(null); return;
    }
    const view = this.savedViews().find(item => item.id === id);
    if (!view) throw new Error(`Unknown saved view: ${id}`);
    this.setState(view.state); this._activeViewId.set(id); this.viewApplied.emit(view);
  }

  renameView(id: string, name: string): void {
    if (!this.savedViews().some(view => view.id === id)) throw new Error(`Unknown saved view: ${id}`);
    const trimmed = this.validateViewName(name, id);
    this.savedViews.update(views => views.map(view => view.id === id ? { ...view, name: trimmed } : view));
  }

  deleteView(id: string): void {
    this.savedViews.update(views => views.filter(view => view.id !== id));
    if (this.activeViewId() === id) this.applyView(null);
  }

  protected updateCurrentView(): void {
    const view = this.savedViews().find(v => v.id === this.activeViewId()); if (view) this.saveView(view.name, view.id);
  }

  protected openSavedViewDialog(rename = false): void {
    const current = rename ? this.savedViews().find(v => v.id === this.activeViewId()) : undefined;
    this._dialog.open<DataViewSavedViewDialog, unknown, string>(DataViewSavedViewDialog, {
      width: '420px', maxWidth: 'calc(100vw - 32px)', showCloseButton: true,
      data: { name: current?.name, existingNames: this.savedViews().filter(v => v.id !== current?.id).map(v => v.name) }
    }).afterClosed().subscribe(name => { if (name) { if (current) this.renameView(current.id, name); else this.saveView(name); } });
  }

  private viewStorage() {
    return this._config?.viewStorage ?? this._doc.defaultView?.localStorage;
  }

  protected headerId(field: string): string { return `${this.gridId}-header-${this.columnIndex(field)}`; }
  protected cellId(row: number, field: string): string { return `${this.gridId}-row-${row}-cell-${this.columnIndex(field)}`; }
  protected columnIndex(field: string): number { return this.logicalColumns().indexOf(field) + 1; }
  protected rowOwnedCells(row: number): string { return this.logicalColumns().map(field => this.cellId(row, field)).join(' '); }
  protected headerOwnedCells(): string { return this.logicalColumns().map(field => this.headerId(field)).join(' '); }
  protected globalRowIndex(row: number): number { return row + (this.withPagination() || this.rowModelType() === 'serverSide' ? this.pageIndex() * this.pageSize() : 0); }
  protected isActiveCell(row: number, field: string): boolean {
    return this.activeCell().row === row && this.activeCell().column === this.columnIndex(field) - 1;
  }

  protected activateCell(event: MouseEvent, row: number, field: string): void {
    this.activeCell.set({ row, column: this.columnIndex(field) - 1 });
    if (!this._isInteractiveRowClick(event)) this._elRef.nativeElement.querySelector<HTMLElement>('[role="grid"]')?.focus({ preventScroll: true });
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('button, input, select, textarea, [contenteditable="true"], [role="combobox"], [role="separator"], [role="button"]')) return;
    const active = this.activeCell(); let { row, column } = active;
    const length = this.effectiveDataLength(); if (!length) return;
    const maxCol = this.logicalColumns().length - 1;
    const page = Math.max(1, Math.floor(this._viewportHeight() / this.rowHeight()));
    const rtl = this._doc.defaultView?.getComputedStyle(this._elRef.nativeElement).direction === 'rtl';
    switch (event.key) {
      case 'ArrowDown': row++; break;
      case 'ArrowUp': row--; break;
      case 'ArrowRight': column += rtl ? -1 : 1; break;
      case 'ArrowLeft': column += rtl ? 1 : -1; break;
      case 'Home': column = 0; if (event.ctrlKey || event.metaKey) row = 0; break;
      case 'End': column = maxCol; if (event.ctrlKey || event.metaKey) row = length - 1; break;
      case 'PageDown': row += page; break;
      case 'PageUp': row -= page; break;
      case ' ': if (this.withSelection()) { this.selectKeyboardRange(row, event.shiftKey); event.preventDefault(); } return;
      case 'a': if ((event.ctrlKey || event.metaKey) && this.withSelection()) { this.selectAll(); event.preventDefault(); } return;
      case 'Escape': if (this.withSelection()) this.unselectAll(); return;
      case 'Enter': { const record = this.pageRows()[row]; if (record) this.rowActivated.emit(record); return; }
      default: return;
    }
    event.preventDefault(); row = Math.max(0, Math.min(row, length - 1)); column = Math.max(0, Math.min(column, maxCol));
    this.activeCell.set({ row, column }); this.revealActiveCell();
    if (event.shiftKey && this.withSelection() && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) this.selectKeyboardRange(row, true);
  }

  private pageRows(): T[] {
    if (this.rowModelType() === 'serverSide') return this.dataSource().data;
    const data = this.dataSource().sortedData;
    return this.withPagination() ? data.slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()) : data;
  }

  private selectKeyboardRange(index: number, extend: boolean): void {
    const rows = this.pageRows(); const record = rows[index]; if (!record) return;
    if (this.rowSelection() === 'single') { this.selection.clear(); this.selection.select(record); }
    else if (extend) this.selection.selectRows(rows.slice(Math.min(this._selectionAnchor, index), Math.max(this._selectionAnchor, index) + 1));
    else {
      this._selectionAnchor = index;
      if (this.selection.isSelected(record)) this.selection.deselect(record); else this.selection.select(record);
    }
    this.rowSelectionChanged.emit({ source: 'keyboard', row: record, checked: this.selection.isSelected(record) }); this.emitSelection();
  }

  private revealActiveCell(): void {
    const scroller = this._scrollbarArea()?.scrollableContentRef().nativeElement; if (!scroller) return;
    const active = this.activeCell(); const top = active.row * this.rowHeight();
    const next = top < scroller.scrollTop ? top : top + this.rowHeight() > scroller.scrollTop + scroller.clientHeight ? top + this.rowHeight() - scroller.clientHeight : scroller.scrollTop;
    scroller.scrollTop = Math.max(0, next); this._scrollTop.set(scroller.scrollTop); this._lastScrollTop = scroller.scrollTop;
    const field = this.logicalColumns()[active.column];
    if (this.centerColumns().some(c => c.field === field)) {
      const header = this._doc.getElementById(this.headerId(field)); const viewport = this._headerCenter()?.nativeElement;
      if (header && viewport) {
        const cellRect = header.getBoundingClientRect(); const viewportRect = viewport.getBoundingClientRect();
        if (cellRect.left < viewportRect.left) scroller.scrollLeft -= viewportRect.left - cellRect.left;
        else if (cellRect.right > viewportRect.right) scroller.scrollLeft += cellRect.right - viewportRect.right;
      }
    }
    this._lastScrollLeft = scroller.scrollLeft; this._syncTransforms();
  }

  protected columnPixelWidth(col: DataViewColumnDef): number {
    const header = this._doc.getElementById(this.headerId(col.field));
    return Math.round(header?.getBoundingClientRect().width || parseFloat(String(col.width ?? this.minColumnWidth())));
  }
  protected columnMinWidth(col: DataViewColumnDef): number { return parseFloat(String(col.minWidth ?? this.minColumnWidth())); }
  protected columnMaxWidth(col: DataViewColumnDef): number { return parseFloat(String(col.maxWidth ?? 2000)); }
  protected resizeColumnWithKeyboard(event: KeyboardEvent, col: DataViewColumnDef): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const min = parseFloat(String(col.minWidth ?? this.minColumnWidth()));
    const max = parseFloat(String(col.maxWidth ?? 2000));
    const width = event.key === 'Home' ? min : event.key === 'End' ? max : this.columnPixelWidth(col) + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 1 : 10);
    this._manualWidths.update(widths => ({ ...widths, [col.field]: `${Math.max(min, Math.min(max, width))}px` }));
  }

  setColumnFilter(field: string, filter: DataViewColumnFilter | null): void {
    const column = this.normalizedColumns().find(c => c.field === field);
    if (!column) throw new Error(`Unknown column: ${field}`);
    if (filter && column.filter && filter.type !== column.filter.type) throw new Error(`Filter type must be ${column.filter.type}`);
    const updated = { ...this.normalizedFilters() };
    const normalized = filter ? normalizeDataViewFilter(filter) : null;
    if (normalized) Object.defineProperty(updated, field, { value: normalized, enumerable: true, writable: true, configurable: true });
    else delete updated[field];
    this.columnFilters.set(updated);
  }

  clearFilters(): void { this.search.set(''); this.columnFilters.set({}); }

  protected openColumnFilter(column: DataViewColumnDef): void {
    this._dialog.open<DataViewColumnFilterDialog, unknown, { filter: DataViewColumnFilter | null }>(DataViewColumnFilterDialog, {
      width: '420px', maxWidth: 'calc(100vw - 32px)', showCloseButton: true,
      data: { column, filter: this.normalizedFilters()[column.field] }
    }).afterClosed().subscribe(result => { if (result) this.setColumnFilter(column.field, result.filter); });
  }
}
