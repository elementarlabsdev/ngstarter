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
import {
  DataViewInterface,
  DataViewAPI,
  DataViewCellRendererDef,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams,
  DataViewRowModelType,
  DataViewRowSelectionEvent, DATA_VIEW, DataViewState, DataViewPinAlign,
} from '../types';
import { SelectionModel } from '@angular/cdk/collections';
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
    '[class.is-loading]': '_isLoading()',
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
  private _refreshTrigger = signal(0);
  private _serverSideRowCount = signal(0);
  private _manualOrder = signal<string[] | null>(null);
  private _manualVisibility = signal<Record<string, boolean>>({});
  private _hasDataOnServer = signal<boolean | undefined>(undefined);

  private _internalLoading = signal(false);
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
  private _manualWidths = signal<Record<string, string | undefined>>({});
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
      const width = this._normalizeWidth(overrideWidth ?? mergedCol.width);
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
    const rowModelType = this.rowModelType();
    const refreshTriggerValue = this._refreshTrigger();
    if (rowModelType === 'serverSide') {
      return;
    }
    untracked(() => {
      this._dataSource.data = data;
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
      return;
    }

    const pIndex = this.pageIndex();
    const pSize = this.pageSize();
    const search = this._debouncedSearch()?.trim() || '';

    // Capture sort params outside untracked but avoid triggering when sort is null due to @if toggling
    const sort = this._ngsSort();
    const sortActive = sort?.active();
    const sortDirection = sort?.direction();
    const sortModel = sortActive ? [{ colId: sortActive, sort: (sortDirection as any) || '' }] : [];

    const refreshTriggerValue = this._refreshTrigger();

    // Build a stable request key to avoid refetch loops when the view toggles (e.g. empty state removes ngsSort)
    const requestKey = `${pIndex}|${pSize}|${JSON.stringify(sortModel)}|${search}|${refreshTriggerValue}`;
    if (this._lastRequestKey === requestKey) {
      return; // no meaningful params change — skip triggering a new request
    }

    // Special case: if sort was active and now is undefined because component was removed from DOM,
    // but we ARE loading or in a state where we expect it to come back, we might want to wait.
    // However, the requestKey should handle it. If sortActive becomes undefined, requestKey changes.

    const isFilterRequest = this._lastRequestKey !== null && this._lastRequestKey.split('|')[3] !== search;
    const isSortRequest = this._lastRequestKey !== null && this._lastRequestKey.split('|')[2] !== JSON.stringify(sortModel);
    this._lastRequestKey = requestKey;

    untracked(() => {
      const currentRequestId = ++this._requestId;
      if (isFilterRequest) {
        this._isFiltering.set(true);
      }
      if (isSortRequest) {
        this._isSorting.set(true);
      }
      this._internalLoading.set(true);
      const params: DataViewGetRowsParams = {
        startRow: pIndex * pSize,
        endRow: (pIndex + 1) * pSize,
        page: pIndex,
        pageSize: pSize,
        sortModel,
        filterModel: search,
        successCallback: (rows: any[], lastRow?: number) => {
          this._ngZone.run(() => {
            if (this._isDestroyed || currentRequestId !== this._requestId) return;
            this._dataSource.data = rows;
            if (lastRow !== undefined) {
              this._serverSideRowCount.set(lastRow);

              // Update _hasDataOnServer if we have any rows OR if we are doing a clean request (no filters)
              if (lastRow > 0) {
                this._hasDataOnServer.set(true);
              } else if (!search && !sortModel.length) {
                this._hasDataOnServer.set(false);
              }
            } else {
              // If lastRow is not provided, we can only infer _hasDataOnServer if we actually got rows
              if (rows.length > 0) {
                this._hasDataOnServer.set(true);
              } else if (!search && !sortModel.length) {
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
        failCallback: () => {
          this._ngZone.run(() => {
            if (this._isDestroyed || currentRequestId !== this._requestId) return;
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
        datasource.getItems(params);
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
  search = input<string>('');
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

  protected injector = inject(Injector);
  protected selection = new SelectionModel<T>(this.rowSelection() === 'multiple', []);
  protected cellRenderersMap = new Map<string, any>();
  protected loadingCellRenderers = signal(false);

  readonly rowSelectionChanged = output<DataViewRowSelectionEvent<T>>();
  readonly selectionChanged = output<T[]>();
  readonly allRowsSelectionChanged = output<boolean>();
  readonly sortChange = output<Sort>();
  readonly loadEnd = output<void>();
  readonly refreshEnd = output<void>();

  get api(): DataViewAPI<T> {
    return {
      search: (value: string): void => {
        this.dataSource().filter = value.trim().toLowerCase();
      },
      selectAll: (): void => {
        this.selectAll();
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
      }
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
    return !!this.search().trim();
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
      const mode = this.rowSelection();
      untracked(() => {
        const currentSelection = this.selection.selected;
        this.selection = new SelectionModel<T>(mode === 'multiple', currentSelection);
      });
    });

    this._destroyRef.onDestroy(() => {
      this._isDestroyed = true;
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
      const dataSource = this.dataSource();
      if (sort && dataSource && !this._isDestroyed && this.rowModelType() !== 'serverSide') {
        dataSource.sort = sort;
        dataSource._updateChangeSubscription();
      }
    });

    effect(() => {
      const active = this.paginator() ?? this._internalPaginator();
      const dataSource = this.dataSource();
    if (dataSource && !this._isDestroyed) {
      if (this.withPagination() && this.rowModelType() !== 'serverSide' && active && this.isBrowser()) {
        // We handle pagination manually in visibleRows to have better control over virtualization.
        // If we assign it to dataSource.paginator, TableDataSource would also start paging data,
        // which would cause issues when we also slice data in visibleRows (double paging).
        dataSource.paginator = null as any;
      } else {
        dataSource.paginator = null as any;
      }
    }
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
  }

  ngOnInit() {
    this._initialViewState.set(this.columnDefs().map(col => ({
      field: col.field,
      visible: col.visible ?? true,
      width: col.width,
      pinned: col.pinned,
      pinAlign: col.pinAlign
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
    const data = this.rowModelType() === 'serverSide' ? this.dataSource().data : this.data();
    return this.selection.selected.length === data.length;
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

    this.selectionChanged.emit(this.selection.selected);
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
  }

  protected sortColumn(col: DataViewColumnDef, direction: SortDirection): void {
    const sort = this.ngsSort;
    if (sort) {
      sort.active.set(col.field);
      sort.direction.set(direction);
      sort.sortChange.emit({ active: col.field, direction });
    }
    this.onSortChange({ active: col.field, direction });
  }

  getSnapshot(): DataViewState[] {
    return this.normalizedColumns().map(col => ({
      field: col.field,
      visible: col.visible ?? true,
      width: col.width,
      pinned: col.pinned,
      pinAlign: col.pinAlign
    }));
  }

  applyState(state: DataViewState[]): void {
    if (!state || state.length === 0) return;

    const pinOverrides = { ...this._manualPinned() };
    const widthOverrides = { ...this._manualWidths() };
    this.columnDefs().forEach(col => {
      const colState = state.find(s => s.field === col.field);
      if (colState) {
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
    const visibleCols = this.normalizedColumns().filter(c => c.visible);
    const colIndex = visibleCols.indexOf(visibleCols.find(c => c.field === col.field)!);

    if (colIndex !== -1) {
      const rows = Array.from(gridRoot.querySelectorAll('.grid-row')) as HTMLElement[];
      const rowsToMeasure = rows.slice(0, 50);

      rowsToMeasure.forEach(row => {
        const cells = Array.from(row.querySelectorAll('.cell')) as HTMLElement[];
        const cell = cells[colIndex];
        if (cell) {
          const content = cell.firstElementChild as HTMLElement;
          if (content) {
            const width = content.scrollWidth + 32; // + padding
            if (width > maxContentWidth) {
              maxContentWidth = width;
            }
          }
        }
      });
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
    if (this.rowModelType() !== 'serverSide') {
      this.dataSource().sort = this.ngsSort || null;
    }
    this.sortChange.emit(event);
  }

  selectAll(): void {
    const data = this.rowModelType() === 'serverSide' ? this.dataSource().data : this.data();
    this.selection.select(...data);
    this.selectionChanged.emit(data);
    this.allRowsSelectionChanged.emit(true);
  }

  unselectAll(): void {
    this.selection.clear();
    this.selectionChanged.emit([]);
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
    this.selectionChanged.emit(this.selection.selected);
  }

  isSelected(row: T): boolean {
    return this.selection.isSelected(row);
  }

  hasSelected(): boolean {
    return this.selection.hasValue();
  }
}
