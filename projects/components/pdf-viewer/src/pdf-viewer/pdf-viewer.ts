import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MatchFlag, Rotation } from '@embedpdf/models';
import type { PdfDocumentObject, PdfEngine, PdfPageObject, SearchResult } from '@embedpdf/models';
import { BlockLoader } from '@ngstarter-ui/components/block-loader';
import { Button } from '@ngstarter-ui/components/button';
import { Divider } from '@ngstarter-ui/components/divider';
import { Icon } from '@ngstarter-ui/components/icon';
import { ImagePlaceholder } from '@ngstarter-ui/components/image-placeholder';
import {
  Menu,
  MenuDivider,
  MenuHeading,
  MenuItem,
  MenuTrigger,
} from '@ngstarter-ui/components/menu';
import {
  Panel,
  PanelAside,
  PanelContent,
  PanelHeader,
  PanelSidebar,
} from '@ngstarter-ui/components/panel';
import {
  Toolbar,
  ToolbarItem,
  ToolbarSpacer,
  ToolbarTitle,
} from '@ngstarter-ui/components/toolbar';
import { isObservable } from 'rxjs';
import type { Subscription } from 'rxjs';
import { PdfViewerAnnotations } from '../pdf-viewer-annotations/pdf-viewer-annotations';
import { PdfViewerAnnotationDef } from '../pdf-viewer-annotation-def.directive';
import { PdfViewerEngineService } from '../pdf-viewer-engine.service';
import { PdfViewerSearch } from '../pdf-viewer-search/pdf-viewer-search';
import {
  PdfViewerAnnotationDataSource,
  PdfViewerAnnotationDataSourceContext,
  PdfViewerAnnotationDataSourceResult,
  PdfViewerAnnotationView,
  PdfViewerLoadedEvent,
  PdfViewerPageRenderedEvent,
  PdfViewerSearchOptions,
  PdfViewerSearchResultView,
  PdfViewerThumbnailView,
  PdfViewerPageView,
  PdfViewerSelectionRectView,
  PdfViewerServerAnnotationDataSource,
  PdfViewerSource,
  PdfViewerTextGlyphView,
} from '../types';

interface PdfViewerPageListItem {
  pageNumber: number;
  thumbnail: PdfViewerThumbnailView | null;
}

interface PdfViewerPageSpread {
  id: string;
  leadingPlaceholder: boolean;
  leadingPlaceholderPage: PdfViewerPageView | null;
  pages: PdfViewerPageView[];
}

type PdfViewerSpreadMode = 'single' | 'two-odd' | 'two-even';
type PdfViewerScrollLayout = 'vertical' | 'horizontal';
type PdfViewerZoomMode = 'custom' | 'fit-page' | 'fit-width';

interface PdfViewerSelectionPoint {
  pageNumber: number;
  x: number;
  y: number;
  offset: number;
}

interface PdfViewerTextLineView {
  lineId: number;
  glyphs: PdfViewerTextGlyphView[];
  top: number;
  bottom: number;
  left: number;
  right: number;
  center: number;
}

interface PdfViewerZoomAnchor {
  container: HTMLElement;
  pageNumber: number;
  relativeX: number;
  relativeY: number;
  viewportX: number;
  viewportY: number;
}

@Component({
  selector: 'ngs-pdf-viewer',
  exportAs: 'ngsPdfViewer',
  imports: [
    BlockLoader,
    Button,
    Divider,
    Icon,
    ImagePlaceholder,
    Menu,
    MenuDivider,
    MenuHeading,
    MenuItem,
    MenuTrigger,
    Panel,
    PanelAside,
    PanelContent,
    PanelHeader,
    PanelSidebar,
    Toolbar,
    ToolbarItem,
    ToolbarSpacer,
    ToolbarTitle,
    PdfViewerAnnotations,
    PdfViewerSearch,
  ],
  templateUrl: './pdf-viewer.html',
  styleUrl: './pdf-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-pdf-viewer not-prose',
    '[class.is-loading]': 'isLoading()',
    '[class.has-toolbar]': 'showToolbar()',
    '[class.has-page-list]': 'isPageListVisible()',
    '[class.has-error]': 'errorState()',
  },
})
export class PdfViewer {
  private readonly textSelectionHorizontalPadding = 2;
  private readonly textSelectionLineHeight = 1.2;
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly engineService = inject(PdfViewerEngineService);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly viewerBody = viewChild<ElementRef<HTMLElement>>('viewerBody');
  private readonly pageList = viewChild<ElementRef<HTMLElement>>('pageList');
  protected readonly annotationDefs = contentChildren(PdfViewerAnnotationDef, { descendants: true });

  src = input<PdfViewerSource>(null);
  documentName = input<string | null>(null);
  wasmUrl = input('/assets/embedpdf/pdfium.wasm');
  page = input(1, { transform: numberAttribute });
  scale = input(1, { transform: numberAttribute });
  minScale = input(0.2, { transform: numberAttribute });
  maxScale = input(60, { transform: numberAttribute });
  zoomStep = input(0.1, { transform: numberAttribute });
  maxRenderPixels = input(128_000_000, { transform: numberAttribute });
  maxRenderDimension = input(13_000, { transform: numberAttribute });
  renderAll = input(true, { transform: booleanAttribute });
  showToolbar = input(true, { transform: booleanAttribute });
  showPageList = input(true, { transform: booleanAttribute });
  showSearchPanel = input(true, { transform: booleanAttribute });
  showAnnotationsPanel = input(false, { transform: booleanAttribute });
  annotations = input<PdfViewerAnnotationView[]>([]);
  annotationsDataSource = input<PdfViewerAnnotationDataSource | null>(null);
  annotationTypeProperty = input('type');
  searchQuery = input('');
  withAnnotations = input(true, { transform: booleanAttribute });
  withForms = input(true, { transform: booleanAttribute });

  loaded = output<PdfViewerLoadedEvent>();
  pageChanged = output<number>();
  pageRendered = output<PdfViewerPageRenderedEvent>();
  error = output<unknown>();

  protected readonly isLoading = signal(false);
  protected readonly errorState = signal<unknown>(null);
  protected readonly renderedPages = signal<PdfViewerPageView[]>([]);
  protected readonly thumbnailPages = signal<PdfViewerThumbnailView[]>([]);
  protected readonly pageCount = signal(0);
  protected readonly activePage = signal(1);
  protected readonly zoom = signal(1);
  protected readonly pageListVisible = signal(false);
  protected readonly searchPanelVisible = signal(false);
  protected readonly annotationsPanelVisible = signal(false);
  protected readonly asidePanelInteractive = signal(false);
  protected readonly spreadMode = signal<PdfViewerSpreadMode>('single');
  protected readonly scrollLayout = signal<PdfViewerScrollLayout>('vertical');
  protected readonly pageRotation = signal<Rotation>(Rotation.Degree0);
  protected readonly zoomMode = signal<PdfViewerZoomMode>('custom');
  protected readonly annotationItems = signal<PdfViewerAnnotationView[]>([]);
  protected readonly activeSearchQuery = signal('');
  protected readonly pdfSearchResults = signal<PdfViewerSearchResultView[]>([]);
  protected readonly selectionRects = signal<PdfViewerSelectionRectView[]>([]);
  protected readonly hasDocument = computed(() => this.pageCount() > 0);
  protected readonly isPageListVisible = computed(() =>
    this.showPageList() && this.pageListVisible(),
  );
  protected readonly isSearchPanelVisible = computed(() =>
    this.showSearchPanel() && this.searchPanelVisible(),
  );
  protected readonly isAnnotationsPanelVisible = computed(() =>
    this.showAnnotationsPanel() && !this.searchPanelVisible() && this.annotationsPanelVisible(),
  );
  protected readonly thumbnailPageMap = computed(() =>
    new Map(this.thumbnailPages().map((thumbnail) => [thumbnail.pageNumber, thumbnail])),
  );
  protected readonly pageItems = computed<PdfViewerPageListItem[]>(() =>
    Array.from({ length: this.pageCount() }, (_, index) => {
      const pageNumber = index + 1;

      return {
        pageNumber,
        thumbnail: this.thumbnailPageMap().get(pageNumber) ?? null,
      };
    }),
  );
  protected readonly canGoPrevious = computed(() => this.activePage() > 1);
  protected readonly canGoNext = computed(() => this.activePage() < this.pageCount());
  protected readonly canZoomOut = computed(() => this.zoom() > this.getScaleBounds().min);
  protected readonly canZoomIn = computed(() => this.zoom() < this.getScaleBounds().max);
  protected readonly zoomLabel = computed(() => `${Math.round(this.zoom() * 100)}%`);
  protected readonly displayDocumentName = computed(() => this.documentName() || this.getSourceName(this.src()));
  protected readonly pageSpreads = computed<PdfViewerPageSpread[]>(() =>
    this.groupPagesIntoSpreads(this.renderedPages(), this.spreadMode()),
  );
  protected readonly zoomPresets = [0.25, 0.5, 1, 1.25, 1.5, 2, 4, 8, 16];

  private engine: PdfEngine<Blob> | null = null;
  private pdfDocument: PdfDocumentObject | null = null;
  private registry: { destroy(): Promise<void> | void } | null = null;
  private pageIntersectionObserver: IntersectionObserver | null = null;
  private visiblePageRatios = new Map<number, number>();
  private loadToken = 0;
  private renderToken = 0;
  private searchToken = 0;
  private scrollSyncFrame: number | null = null;
  private programmaticScrollTargetPage: number | null = null;
  private programmaticScrollTimeout: number | null = null;
  private pageObserverFrame: number | null = null;
  private pageObserverTimeout: number | null = null;
  private visiblePageRenderFrame: number | null = null;
  private visiblePageRenderTimeout: number | null = null;
  private pageObserverRefreshAttempts = 0;
  private selectionStart: PdfViewerSelectionPoint | null = null;
  private isViewInitialized = false;
  private annotationDataSourceToken = 0;
  private annotationDataSourceCleanup: (() => void) | null = null;
  private lastZoomChangeTime = 0;
  private readonly programmaticScrollMinDuration = 900;
  private readonly programmaticScrollMaxDuration = 6000;
  private readonly qualityRenderZoomIdleDelay = 160;
  private readonly documentOpenTimeoutMs = 15000;

  constructor() {
    afterNextRender(() => {
      if (this.isBrowser) {
        this.asidePanelInteractive.set(true);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.loadToken++;
      this.renderToken++;
      this.searchToken++;
      this.annotationDataSourceToken++;
      this.annotationDataSourceCleanup?.();
      this.cancelScrollSyncFrame();
      this.clearProgrammaticScrollLock();
      this.cancelPageObserverFrame();
      this.cancelVisiblePageRenderFrame();
      this.disconnectPageObserver();
      this.revokeRenderedPages();
      this.revokeThumbnailPages();
      void this.closeDocument();
      void this.registry?.destroy();
    });

    effect((onCleanup) => {
      const dataSource = this.annotationsDataSource();
      const fallbackAnnotations = this.annotations();
      const source = this.src();
      const documentName = this.documentName() || this.getSourceName(source);
      const pageCount = this.pageCount();
      const token = ++this.annotationDataSourceToken;
      const context: PdfViewerAnnotationDataSourceContext = {
        source,
        documentName,
        pageCount,
      };

      this.annotationDataSourceCleanup?.();
      this.annotationDataSourceCleanup = untracked(() =>
        this.loadAnnotationsDataSource(dataSource ?? fallbackAnnotations, context, token),
      );

      onCleanup(() => {
        this.annotationDataSourceCleanup?.();
        this.annotationDataSourceCleanup = null;
      });
    });

    effect(() => {
      const source = this.src();
      const wasmUrl = this.wasmUrl();

      if (!this.isViewInitialized || !this.isBrowser) {
        return;
      }

      untracked(() => {
        void this.loadDocument(source, wasmUrl);
      });
    });

    effect(() => {
      const scale = this.sanitizeScale(this.scale());

      if (untracked(() => this.zoom()) !== scale) {
        untracked(() => this.setZoom(scale));
      }
    });

    effect(() => {
      const requestedPage = this.sanitizePage(this.page());

      if (requestedPage !== untracked(() => this.activePage())) {
        this.activePage.set(requestedPage);
      }
    });

    effect(() => {
      const query = this.searchQuery();

      if (query !== untracked(() => this.activeSearchQuery())) {
        this.activeSearchQuery.set(query);
        untracked(() => {
          void this.searchPdf(query, {
            caseSensitive: false,
            wholeWord: false,
          });
        });
      }
    });

    effect(() => {
      const zoom = this.zoom();
      const renderAll = this.renderAll();
      const activePage = renderAll ? untracked(() => this.activePage()) : this.activePage();
      const withAnnotations = this.withAnnotations();
      const withForms = this.withForms();
      this.pageRotation();
      this.spreadMode();
      this.scrollLayout();

      if (!this.pdfDocument || !this.engine || this.isLoading()) {
        return;
      }

      untracked(() => {
        this.applyInstantZoom(zoom);
        this.schedulePageObserverRefresh();
        this.scheduleVisiblePagesRender({ zoom, activePage, renderAll, withAnnotations, withForms });
      });
    });

    effect(() => {
      const withAnnotations = this.withAnnotations();
      const isLoading = this.isLoading();
      const pageCount = this.pageCount();
      this.pageRotation();

      if (isLoading || pageCount === 0 || !this.pdfDocument || !this.engine) {
        return;
      }

      untracked(() => {
        void this.renderThumbnails(this.loadToken, { withAnnotations });
      });
    });
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;

    if (this.isBrowser) {
      void this.loadDocument(this.src(), this.wasmUrl());
    }
  }

  previousPage(): void {
    if (!this.canGoPrevious()) {
      return;
    }

    this.setPage(this.activePage() - 1);
  }

  nextPage(): void {
    if (!this.canGoNext()) {
      return;
    }

    this.setPage(this.activePage() + 1);
  }

  zoomIn(): void {
    this.zoomMode.set('custom');
    this.setZoom(this.roundZoom(this.zoom() + this.sanitizeZoomStep()));
  }

  zoomOut(): void {
    this.zoomMode.set('custom');
    this.setZoom(this.roundZoom(this.zoom() - this.sanitizeZoomStep()));
  }

  togglePageList(): void {
    this.pageListVisible.update((isVisible) => !isVisible);
  }

  protected toggleSearchPanel(): void {
    const nextVisible = !this.searchPanelVisible();
    this.searchPanelVisible.set(nextVisible);

    if (nextVisible) {
      this.annotationsPanelVisible.set(false);
      const query = this.searchQuery();
      this.activeSearchQuery.set(query);
      void this.searchPdf(query, {
        caseSensitive: false,
        wholeWord: false,
      });
    }
  }

  protected toggleAnnotationsPanel(): void {
    const nextVisible = !this.annotationsPanelVisible();
    this.annotationsPanelVisible.set(nextVisible);

    if (nextVisible) {
      this.searchPanelVisible.set(false);
    }
  }

  protected closeAsidePanel(): void {
    this.searchPanelVisible.set(false);
    this.annotationsPanelVisible.set(false);
  }

  protected updatePdfSearch(
    event: {
      query: string;
      options: PdfViewerSearchOptions;
    },
  ): Promise<void> {
    this.activeSearchQuery.set(event.query);
    return this.searchPdf(event.query, event.options);
  }

  protected selectSearchResult(result: PdfViewerSearchResultView): void {
    this.setPage(result.pageNumber);
  }

  protected setZoomPreset(scale: number): void {
    this.zoomMode.set('custom');
    this.setZoom(scale);
  }

  protected isZoomPresetSelected(scale: number): boolean {
    return this.zoomMode() === 'custom' && Math.abs(this.zoom() - this.sanitizeScale(scale)) < 0.0001;
  }

  protected fitToPage(): void {
    const scale = this.getFitScale('fit-page');

    if (scale === null) {
      return;
    }

    this.zoomMode.set('fit-page');
    this.setZoom(scale);
  }

  protected fitToWidth(): void {
    const scale = this.getFitScale('fit-width');

    if (scale === null) {
      return;
    }

    this.zoomMode.set('fit-width');
    this.setZoom(scale);
  }

  protected setSpreadMode(mode: PdfViewerSpreadMode): void {
    this.spreadMode.set(mode);
    this.refreshLayoutAfterModeChange();
  }

  protected setScrollLayout(layout: PdfViewerScrollLayout): void {
    this.scrollLayout.set(layout);
    this.refreshLayoutAfterModeChange();
  }

  protected rotateClockwise(): void {
    this.setPageRotation(this.rotatePageBy(1));
  }

  protected rotateCounterClockwise(): void {
    this.setPageRotation(this.rotatePageBy(-1));
  }

  private groupPagesIntoSpreads(
    pages: PdfViewerPageView[],
    mode: PdfViewerSpreadMode,
  ): PdfViewerPageSpread[] {
    if (mode === 'single') {
      return pages.map((page) => ({
        id: `single-${page.pageNumber}`,
        leadingPlaceholder: false,
        leadingPlaceholderPage: null,
        pages: [page],
      }));
    }

    const spreads: PdfViewerPageSpread[] = [];
    let pageIndex = 0;

    if (mode === 'two-even' && pages.length > 0) {
      spreads.push({
        id: 'two-even-cover',
        leadingPlaceholder: true,
        leadingPlaceholderPage: pages[0],
        pages: [pages[0]],
      });
      pageIndex = 1;
    }

    while (pageIndex < pages.length) {
      const spreadPages = pages.slice(pageIndex, pageIndex + 2);
      spreads.push({
        id: `${mode}-${spreadPages.map((page) => page.pageNumber).join('-')}`,
        leadingPlaceholder: false,
        leadingPlaceholderPage: null,
        pages: spreadPages,
      });
      pageIndex += 2;
    }

    return spreads;
  }

  private setPageRotation(rotation: Rotation): void {
    this.pageRotation.set(rotation);
    this.applyInstantZoom(this.zoom());
    this.refreshLayoutAfterModeChange();
  }

  private rotatePageBy(delta: 1 | -1): Rotation {
    return this.normalizeRotation(this.pageRotation() + delta);
  }

  private refreshLayoutAfterModeChange(): void {
    this.selectionStart = null;
    this.selectionRects.set([]);
    this.schedulePageObserverRefresh();

    const targetWindow = this.document.defaultView;

    if (!targetWindow) {
      this.scrollToPage(this.activePage());
      return;
    }

    targetWindow.requestAnimationFrame(() => this.scrollToPage(this.activePage()));
  }

  protected toggleFullscreen(): void {
    if (!this.isBrowser) {
      return;
    }

    const target = this.hostElement.nativeElement;
    const currentFullscreenElement = this.document.fullscreenElement;

    if (currentFullscreenElement) {
      void this.document.exitFullscreen?.();
      return;
    }

    void target.requestFullscreen?.();
  }

  setPage(pageNumber: number): void {
    const nextPage = this.clamp(pageNumber, 1, Math.max(this.pageCount(), 1));
    const hasChanged = nextPage !== this.activePage();

    if (!hasChanged) {
      this.scrollToPage(nextPage);
      this.scrollPageListToPage(nextPage);
      return;
    }

    this.activePage.set(nextPage);
    this.pageChanged.emit(nextPage);
    this.scrollToPage(nextPage);
    this.scrollPageListToPage(nextPage);
  }

  protected onViewerScroll(): void {
    if (!this.renderAll() || !this.isBrowser || this.renderedPages().length < 2) {
      return;
    }

    if (this.scrollSyncFrame !== null) {
      return;
    }

    this.scrollSyncFrame = this.document.defaultView?.requestAnimationFrame(() => {
      this.scrollSyncFrame = null;

      if (this.isProgrammaticScrollActive()) {
        this.completeProgrammaticScrollIfSettled();
        return;
      }

      this.syncActivePageFromViewport();
      this.scheduleCurrentVisiblePagesRender();
    }) ?? null;
  }

  protected onViewerWheel(event: WheelEvent): void {
    if (!event.metaKey && !event.ctrlKey) {
      return;
    }

    if (!this.pdfDocument || this.isLoading()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const container = this.viewerBody()?.nativeElement;
    const anchor = container ? this.getZoomAnchor(container, event) : null;
    const delta = event.deltaY || event.deltaX;
    const direction = delta < 0 ? 1 : -1;
    const multiplier = Math.max(1, Math.min(6, Math.abs(delta) / 100));
    const nextZoom = this.roundZoom(this.zoom() + direction * this.sanitizeZoomStep() * multiplier);

    if (nextZoom === this.zoom()) {
      return;
    }

    this.zoomMode.set('custom');
    this.setZoom(nextZoom);
    this.restoreZoomAnchor(anchor);
  }

  protected selectionRectsForPage(pageNumber: number): PdfViewerSelectionRectView[] {
    return this.selectionRects().filter((rect) => rect.pageNumber === pageNumber);
  }

  protected startTextSelection(event: PointerEvent | MouseEvent, page: PdfViewerPageView): void {
    if (event.button !== 0 || page.textGlyphs.length === 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const surface = event.currentTarget as HTMLElement;
    if ('pointerId' in event) {
      surface.setPointerCapture?.(event.pointerId);
    }

    this.selectionStart = this.getSelectionPoint(event, page, surface);
    this.selectionRects.set([]);
  }

  protected updateTextSelection(event: PointerEvent | MouseEvent, page: PdfViewerPageView): void {
    if (!this.selectionStart || this.selectionStart.pageNumber !== page.pageNumber) {
      return;
    }

    event.preventDefault();
    const surface = event.currentTarget as HTMLElement;
    const currentPoint = this.getSelectionPoint(event, page, surface);

    if (this.selectionStart.offset === currentPoint.offset) {
      this.selectionRects.set([]);
      return;
    }

    this.selectionRects.set(this.getSelectionRects(page, this.selectionStart.offset, currentPoint.offset));
  }

  protected finishTextSelection(event: PointerEvent | MouseEvent, page: PdfViewerPageView): void {
    if (!this.selectionStart) {
      return;
    }

    this.updateTextSelection(event, page);
    this.selectionStart = null;

    const surface = event.currentTarget as HTMLElement;
    if ('pointerId' in event) {
      surface.releasePointerCapture?.(event.pointerId);
    }
  }

  private loadAnnotationsDataSource(
    dataSource: PdfViewerAnnotationDataSource | null | undefined,
    context: PdfViewerAnnotationDataSourceContext,
    token: number,
  ): () => void {
    if (!dataSource) {
      this.setAnnotationItems([], token);
      return () => {};
    }

    try {
      if (Array.isArray(dataSource)) {
        this.setAnnotationItems(dataSource, token);
        return () => {};
      }

      if (this.isServerAnnotationDataSource(dataSource)) {
        let isActive = true;

        dataSource.getAnnotations({
          ...context,
          successCallback: (annotations) => {
            if (isActive) {
              this.setAnnotationItems(annotations, token);
            }
          },
          failCallback: () => {
            if (isActive) {
              this.setAnnotationItems([], token);
            }
          },
        });

        return () => {
          isActive = false;
        };
      }

      const result = typeof dataSource === 'function' ? dataSource(context) : dataSource;

      return this.applyAnnotationDataSourceResult(result, token);
    } catch {
      this.setAnnotationItems([], token);
      return () => {};
    }
  }

  private applyAnnotationDataSourceResult(
    result: PdfViewerAnnotationDataSourceResult,
    token: number,
  ): () => void {
    if (isObservable(result)) {
      const subscription: Subscription = result.subscribe({
        next: (annotations) => this.setAnnotationItems(annotations, token),
        error: () => this.setAnnotationItems([], token),
      });

      return () => subscription.unsubscribe();
    }

    if (this.isPromiseLike(result)) {
      let isActive = true;

      result
        .then((annotations) => {
          if (isActive) {
            this.setAnnotationItems(annotations, token);
          }
        })
        .catch(() => {
          if (isActive) {
            this.setAnnotationItems([], token);
          }
        });

      return () => {
        isActive = false;
      };
    }

    this.setAnnotationItems(result, token);

    return () => {};
  }

  private setAnnotationItems(annotations: PdfViewerAnnotationView[], token: number): void {
    if (token === this.annotationDataSourceToken) {
      this.annotationItems.set(annotations ?? []);
    }
  }

  private isServerAnnotationDataSource(
    dataSource: PdfViewerAnnotationDataSource,
  ): dataSource is PdfViewerServerAnnotationDataSource {
    return typeof dataSource === 'object'
      && dataSource !== null
      && 'getAnnotations' in dataSource
      && typeof dataSource.getAnnotations === 'function';
  }

  private isPromiseLike<T>(value: unknown): value is Promise<T> {
    return typeof value === 'object'
      && value !== null
      && 'then' in value
      && typeof (value as Promise<T>).then === 'function';
  }

  protected cancelTextSelection(): void {
    this.selectionStart = null;
  }

  private async searchPdf(query: string, options: PdfViewerSearchOptions): Promise<void> {
    const token = ++this.searchToken;
    const keyword = query.trim();

    if (!keyword || !this.engine || !this.pdfDocument) {
      this.pdfSearchResults.set([]);
      return;
    }

    const flags: MatchFlag[] = [];

    if (options.caseSensitive) {
      flags.push(MatchFlag.MatchCase);
    }

    if (options.wholeWord) {
      flags.push(MatchFlag.MatchWholeWord);
    }

    try {
      const searchResult = await this.engine.searchAllPages(this.pdfDocument, keyword, { flags }).toPromise();

      if (token !== this.searchToken) {
        return;
      }

      this.pdfSearchResults.set(searchResult.results.map((result, index) => this.toSearchResultView(result, index)));
    } catch (error) {
      if (token === this.searchToken) {
        this.pdfSearchResults.set([]);
        this.error.emit(error);
      }
    }
  }

  private toSearchResultView(result: SearchResult, index: number): PdfViewerSearchResultView {
    const context = result.context;
    const excerpt = [
      context.truncatedLeft ? '...' : '',
      context.before,
      context.match,
      context.after,
      context.truncatedRight ? '...' : '',
    ]
      .filter((part) => part.length > 0)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      id: `${result.pageIndex}-${result.charIndex}-${result.charCount}-${index}`,
      pageNumber: result.pageIndex + 1,
      excerpt,
    };
  }

  private async loadDocument(source: PdfViewerSource, wasmUrl: string): Promise<void> {
    const token = ++this.loadToken;
    this.renderToken++;
    this.isLoading.set(true);
    this.errorState.set(null);
    this.pageCount.set(0);
    this.searchToken++;
    this.selectionStart = null;
    this.selectionRects.set([]);
    this.pdfSearchResults.set([]);
    this.revokeRenderedPages();
    this.revokeThumbnailPages();

    await this.closeDocument();
    await this.registry?.destroy();
    this.registry = null;

    if (!source) {
      this.isLoading.set(false);
      return;
    }

    try {
      const engine = await this.engineService.getEngine(wasmUrl);

      if (token !== this.loadToken) {
        return;
      }

      this.engine = engine;
      this.registry = await this.engineService.createRegistry(engine, this.zoom());

      if (token !== this.loadToken) {
        return;
      }

      const documentId = this.createDocumentId();
      const pdfDocument = await this.openSource(engine, documentId, source);

      if (token !== this.loadToken) {
        await engine.closeDocument(pdfDocument).toPromise();
        return;
      }

      this.pdfDocument = pdfDocument;
      this.pageCount.set(pdfDocument.pageCount);
      this.activePage.set(this.clamp(this.activePage(), 1, Math.max(pdfDocument.pageCount, 1)));
      this.loaded.emit({ pageCount: pdfDocument.pageCount });
      this.initializePageShells(pdfDocument, this.zoom(), this.renderAll(), this.activePage());
      this.schedulePageObserverRefresh();
      await this.searchPdf(this.activeSearchQuery() || this.searchQuery(), {
        caseSensitive: false,
        wholeWord: false,
      });
      await this.renderVisiblePages(token, ++this.renderToken, {
        zoom: this.zoom(),
        activePage: this.activePage(),
        renderAll: this.renderAll(),
        withAnnotations: this.withAnnotations(),
        withForms: this.withForms(),
      });
    } catch (error) {
      if (token === this.loadToken) {
        this.errorState.set(error);
        this.error.emit(error);
      }
    } finally {
      if (token === this.loadToken) {
        this.isLoading.set(false);
      }
    }
  }

  private initializePageShells(
    pdfDocument: PdfDocumentObject,
    scale: number,
    renderAll: boolean,
    activePage: number,
  ): void {
    const previousPages = this.renderedPages();
    const previousPageMap = new Map(previousPages.map((page) => [page.pageNumber, page]));
    const pageNumbers = this.getPageNumbersToDisplay(pdfDocument, renderAll, activePage);
    const nextScale = this.sanitizeScale(scale);
    const nextPages = pageNumbers.map((pageNumber) => {
      const pdfPage = pdfDocument.pages[pageNumber - 1];
      const previousPage = previousPageMap.get(pageNumber);
      const displaySize = this.getPageDisplaySize(pdfPage, nextScale);
      const displayRotation = this.getPageDisplayRotation(pdfPage);
      const isFresh = previousPage?.url
        && Math.abs((previousPage.renderedScale ?? 0) - nextScale) < 0.0001
        && previousPage.renderedRotation === displayRotation;

      return {
        pageNumber,
        url: isFresh ? previousPage.url : null,
        scale: nextScale,
        renderedScale: isFresh ? previousPage.renderedScale : null,
        rotation: displayRotation,
        renderedRotation: isFresh ? previousPage.renderedRotation : null,
        width: displaySize.width,
        height: displaySize.height,
        isRendering: false,
        textGlyphs: isFresh ? previousPage.textGlyphs : [],
      };
    });
    const nextUrlSet = new Set(nextPages.map((page) => page.url).filter((url): url is string => !!url));

    for (const page of previousPages) {
      if (page.url && !nextUrlSet.has(page.url)) {
        this.revokeObjectUrl(page.url);
      }
    }

    this.selectionStart = null;
    this.selectionRects.set([]);
    this.disconnectPageObserver();
    this.renderedPages.set(nextPages);
  }

  private getPageNumbersToDisplay(
    pdfDocument: PdfDocumentObject,
    renderAll: boolean,
    activePage: number,
  ): number[] {
    if (!renderAll) {
      return [this.clamp(activePage, 1, pdfDocument.pageCount)];
    }

    return Array.from({ length: pdfDocument.pageCount }, (_, index) => index + 1);
  }

  private scheduleVisiblePagesRender(
    options: {
      zoom: number;
      activePage: number;
      renderAll: boolean;
      withAnnotations: boolean;
      withForms: boolean;
    },
  ): void {
    const targetWindow = this.document.defaultView;

    if (!targetWindow) {
      return;
    }

    this.cancelVisiblePageRenderFrame();
    const token = this.loadToken;
    const renderToken = ++this.renderToken;
    const renderDelay = this.getQualityRenderDelay();

    if (renderDelay > 0) {
      this.visiblePageRenderTimeout = targetWindow.setTimeout(() => {
        this.visiblePageRenderTimeout = null;
        this.queueVisiblePageRenderFrame(token, renderToken, options);
      }, renderDelay);
      return;
    }

    this.queueVisiblePageRenderFrame(token, renderToken, options);
  }

  private queueVisiblePageRenderFrame(
    token: number,
    renderToken: number,
    options: {
      zoom: number;
      activePage: number;
      renderAll: boolean;
      withAnnotations: boolean;
      withForms: boolean;
    },
  ): void {
    const targetWindow = this.document.defaultView;

    if (!targetWindow) {
      return;
    }

    this.visiblePageRenderFrame = targetWindow.requestAnimationFrame(() => {
      this.visiblePageRenderFrame = null;
      void this.renderVisiblePages(token, renderToken, options);
    });
  }

  private scheduleCurrentVisiblePagesRender(): void {
    this.scheduleVisiblePagesRender({
      zoom: this.zoom(),
      activePage: this.activePage(),
      renderAll: this.renderAll(),
      withAnnotations: this.withAnnotations(),
      withForms: this.withForms(),
    });
  }

  private async renderVisiblePages(
    token: number,
    renderToken: number,
    options: {
      zoom: number;
      activePage: number;
      renderAll: boolean;
      withAnnotations: boolean;
      withForms: boolean;
    },
  ): Promise<void> {
    if (!this.engine || !this.pdfDocument) {
      return;
    }

    const pdfDocument = this.pdfDocument;
    const renderScale = this.sanitizeScale(options.zoom);
    const pageNumbers = this.getPriorityPageNumbers(options.activePage, options.renderAll);

    for (const pageNumber of pageNumbers) {
      if (!this.isRenderCurrent(token, renderToken)) {
        return;
      }

      const currentPage = this.renderedPages().find((page) => page.pageNumber === pageNumber);
      const page = pdfDocument.pages[pageNumber - 1];
      const renderRotation = this.getPageDisplayRotation(page);

      if (!currentPage || Math.abs(currentPage.scale - renderScale) > 0.0001) {
        continue;
      }

      if (
        currentPage.url
        && Math.abs((currentPage.renderedScale ?? 0) - renderScale) < 0.0001
        && currentPage.renderedRotation === renderRotation
      ) {
        continue;
      }

      this.patchRenderedPage(pageNumber, { isRendering: !currentPage.url });
      const rasterOptions = this.getPageRasterRenderOptions(page, renderScale);
      const blob = await this.engine.renderPage(pdfDocument, page, {
        scaleFactor: rasterOptions.scaleFactor,
        rotation: renderRotation,
        dpr: rasterOptions.dpr,
        withAnnotations: options.withAnnotations,
        withForms: options.withForms,
      }).toPromise();

      if (!this.isRenderCurrent(token, renderToken)) {
        return;
      }

      const displaySize = this.getPageDisplaySize(page, renderScale);
      const textGlyphs = this.pageRotation() === Rotation.Degree0
        ? await this.getPageTextGlyphs(pdfDocument, page, renderScale)
        : [];

      if (!this.isRenderCurrent(token, renderToken)) {
        return;
      }

      const url = this.document.defaultView?.URL.createObjectURL(blob) ?? URL.createObjectURL(blob);
      const previousUrl = this.renderedPages().find((renderedPage) => renderedPage.pageNumber === pageNumber)?.url;

      this.patchRenderedPage(pageNumber, {
        url,
        scale: renderScale,
        renderedScale: renderScale,
        rotation: renderRotation,
        renderedRotation: renderRotation,
        width: displaySize.width,
        height: displaySize.height,
        isRendering: false,
        textGlyphs,
      });

      if (previousUrl && previousUrl !== url) {
        this.revokeObjectUrl(previousUrl);
      }

      this.pageRendered.emit({ pageNumber, url, width: displaySize.width, height: displaySize.height });
    }
  }

  private setZoom(scale: number): void {
    const nextZoom = this.sanitizeScale(scale);

    if (this.zoom() !== nextZoom) {
      this.lastZoomChangeTime = this.getCurrentTime();
      this.zoom.set(nextZoom);
    }

    this.applyInstantZoom(nextZoom);
  }

  private applyInstantZoom(scale: number): void {
    const nextScale = this.sanitizeScale(scale);
    const pdfDocument = this.pdfDocument;
    const pages = this.renderedPages();

    if (!pdfDocument || pages.length === 0) {
      return;
    }

    let hasChanges = false;
    const urlsToRevoke: string[] = [];
    const nextPages = pages.map((page) => {
      const pdfPage = pdfDocument.pages[page.pageNumber - 1];
      const displaySize = this.getPageDisplaySize(pdfPage, nextScale);
      const displayRotation = this.getPageDisplayRotation(pdfPage);
      const scaleChanged = Math.abs(page.scale - nextScale) >= 0.0001;
      const rotationChanged = page.rotation !== displayRotation || page.renderedRotation !== displayRotation;

      if (!scaleChanged && !rotationChanged && page.width === displaySize.width && page.height === displaySize.height) {
        return page;
      }

      hasChanges = true;

      if (rotationChanged && page.url) {
        urlsToRevoke.push(page.url);
      }

      return {
        ...page,
        url: rotationChanged ? null : page.url,
        scale: nextScale,
        renderedScale: rotationChanged ? null : page.renderedScale,
        rotation: displayRotation,
        renderedRotation: rotationChanged ? null : page.renderedRotation,
        width: displaySize.width,
        height: displaySize.height,
        isRendering: false,
        textGlyphs: [],
      };
    });

    if (!hasChanges) {
      return;
    }

    this.selectionStart = null;
    this.selectionRects.set([]);
    this.renderedPages.set(nextPages);
    for (const url of urlsToRevoke) {
      this.revokeObjectUrl(url);
    }
    this.schedulePageObserverRefresh();
  }

  private getPriorityPageNumbers(activePage: number, renderAll: boolean): number[] {
    if (!this.pdfDocument) {
      return [];
    }

    const pageCount = this.pdfDocument.pageCount;
    const visiblePageNumbers = renderAll
      ? this.getVisiblePageNumbers()
      : [this.clamp(activePage, 1, pageCount)];
    const priorityPageNumbers = new Set<number>();

    for (const pageNumber of visiblePageNumbers.length > 0 ? visiblePageNumbers : [activePage]) {
      for (let candidate = pageNumber - 1; candidate <= pageNumber + 1; candidate++) {
        if (candidate >= 1 && candidate <= pageCount) {
          priorityPageNumbers.add(candidate);
        }
      }
    }

    priorityPageNumbers.add(this.clamp(activePage, 1, pageCount));

    return [...priorityPageNumbers].sort((a, b) => {
      const activeDistance = Math.abs(a - activePage) - Math.abs(b - activePage);

      return activeDistance || a - b;
    });
  }

  private getVisiblePageNumbers(): number[] {
    const container = this.viewerBody()?.nativeElement;

    if (!container) {
      return [];
    }

    const containerRect = container.getBoundingClientRect();
    const verticalPrefetchMargin = containerRect.height;
    const horizontalPrefetchMargin = containerRect.width;
    const pages = Array.from(container.querySelectorAll<HTMLElement>('[data-ngs-pdf-page]'));
    const visiblePageNumbers: number[] = [];

    for (const page of pages) {
      const rect = page.getBoundingClientRect();
      const pageNumber = Number(page.dataset['ngsPdfPage']);

      if (
        Number.isFinite(pageNumber) &&
        rect.bottom >= containerRect.top - verticalPrefetchMargin &&
        rect.top <= containerRect.bottom + verticalPrefetchMargin &&
        rect.right >= containerRect.left - horizontalPrefetchMargin &&
        rect.left <= containerRect.right + horizontalPrefetchMargin
      ) {
        visiblePageNumbers.push(pageNumber);
      }
    }

    return visiblePageNumbers;
  }

  private patchRenderedPage(pageNumber: number, patch: Partial<PdfViewerPageView>): void {
    this.renderedPages.update((pages) =>
      pages.map((page) => page.pageNumber === pageNumber ? { ...page, ...patch } : page),
    );
  }

  private async renderThumbnails(
    token: number,
    options: {
      withAnnotations: boolean;
    },
  ): Promise<void> {
    if (!this.engine || !this.pdfDocument) {
      return;
    }

    const pdfDocument = this.pdfDocument;
    const thumbnailScale = 0.18;
    const nextThumbnails: PdfViewerThumbnailView[] = [];
    const previousThumbnails = this.thumbnailPages();

    for (const page of pdfDocument.pages) {
      const blob = await this.engine.renderThumbnail(pdfDocument, page, {
        scaleFactor: thumbnailScale,
        rotation: this.getPageDisplayRotation(page),
        dpr: this.getDevicePixelRatio(),
        withAnnotations: options.withAnnotations,
      }).toPromise();

      if (token !== this.loadToken) {
        const staleUrl = this.document.defaultView?.URL.createObjectURL(blob) ?? URL.createObjectURL(blob);
        this.revokeObjectUrl(staleUrl);
        return;
      }

      const url = this.document.defaultView?.URL.createObjectURL(blob) ?? URL.createObjectURL(blob);
      const pageNumber = page.index + 1;
      const displaySize = this.getPageDisplaySize(page, thumbnailScale);
      nextThumbnails.push({ pageNumber, url, width: displaySize.width, height: displaySize.height });
    }

    if (token !== this.loadToken) {
      for (const thumbnail of nextThumbnails) {
        this.revokeObjectUrl(thumbnail.url);
      }
      return;
    }

    this.thumbnailPages.set(nextThumbnails);

    for (const thumbnail of previousThumbnails) {
      this.revokeObjectUrl(thumbnail.url);
    }
  }

  private async getPageTextGlyphs(
    pdfDocument: PdfDocumentObject,
    page: PdfPageObject,
    scale: number,
  ): Promise<PdfViewerTextGlyphView[]> {
    if (!this.engine) {
      return [];
    }

    try {
      const geometry = await this.engine.getPageGeometry(pdfDocument, page).toPromise();
      const displaySize = this.getPageDisplaySize(page, scale);
      const glyphs: PdfViewerTextGlyphView[] = [];

      for (const run of geometry.runs) {
        for (const glyph of run.glyphs) {
          if ((glyph.flags & 2) === 2 || glyph.width <= 0 || glyph.height <= 0) {
            continue;
          }

          const glyphLeft = glyph.x * scale;
          const glyphTop = glyph.y * scale;
          const glyphWidth = glyph.width * scale;
          const glyphHeight = glyph.height * scale;
          const lineHeight = Math.max(
            glyphHeight,
            (run.fontSize ?? glyph.height) * this.textSelectionLineHeight * scale,
          );
          const lineTop = this.clamp(glyphTop - (lineHeight - glyphHeight) / 2, 0, displaySize.height);
          const lineBottom = this.clamp(lineTop + lineHeight, 0, displaySize.height);
          const left = this.clamp(glyphLeft, 0, displaySize.width);
          const right = this.clamp(glyphLeft + glyphWidth, 0, displaySize.width);

          glyphs.push({
            index: glyphs.length,
            left,
            top: this.clamp(glyphTop, 0, displaySize.height),
            width: Math.max(0, right - left),
            height: Math.max(0, glyphHeight),
            lineTop,
            lineHeight: Math.max(0, lineBottom - lineTop),
            lineId: -1,
          });
        }
      }

      return this.assignTextGlyphLines(glyphs).map((glyph) => ({
        ...glyph,
        left: this.roundCssPixel(glyph.left),
        top: this.roundCssPixel(glyph.top),
        width: this.roundCssPixel(glyph.width),
        height: this.roundCssPixel(glyph.height),
        lineTop: this.roundCssPixel(glyph.lineTop),
        lineHeight: this.roundCssPixel(glyph.lineHeight),
      }));
    } catch {
      return [];
    }
  }

  private assignTextGlyphLines(glyphs: PdfViewerTextGlyphView[]): PdfViewerTextGlyphView[] {
    const lines: PdfViewerTextLineView[] = [];

    for (const glyph of [...glyphs].sort((a, b) => a.lineTop - b.lineTop || a.left - b.left)) {
      const glyphBottom = glyph.lineTop + glyph.lineHeight;
      const glyphCenter = glyph.lineTop + glyph.lineHeight / 2;
      let line = lines.find((candidate) =>
        this.rangesOverlap(candidate.top, candidate.bottom, glyph.lineTop, glyphBottom) ||
        Math.abs(candidate.center - glyphCenter) <= Math.max(2, glyph.lineHeight * 0.4),
      );

      if (!line) {
        line = {
          lineId: lines.length,
          glyphs: [],
          top: glyph.lineTop,
          bottom: glyphBottom,
          left: glyph.left,
          right: glyph.left + glyph.width,
          center: glyphCenter,
        };
        lines.push(line);
      }

      glyph.lineId = line.lineId;
      line.glyphs.push(glyph);
      line.top = Math.min(line.top, glyph.lineTop);
      line.bottom = Math.max(line.bottom, glyphBottom);
      line.left = Math.min(line.left, glyph.left);
      line.right = Math.max(line.right, glyph.left + glyph.width);
      line.center = line.top + (line.bottom - line.top) / 2;
    }

    return glyphs;
  }

  private getTextLines(glyphs: PdfViewerTextGlyphView[]): PdfViewerTextLineView[] {
    const lines = new Map<number, PdfViewerTextLineView>();

    for (const glyph of glyphs) {
      const glyphBottom = glyph.lineTop + glyph.lineHeight;
      const glyphRight = glyph.left + glyph.width;
      const existing = lines.get(glyph.lineId);

      if (!existing) {
        lines.set(glyph.lineId, {
          lineId: glyph.lineId,
          glyphs: [glyph],
          top: glyph.lineTop,
          bottom: glyphBottom,
          left: glyph.left,
          right: glyphRight,
          center: glyph.lineTop + glyph.lineHeight / 2,
        });
        continue;
      }

      existing.glyphs.push(glyph);
      existing.top = Math.min(existing.top, glyph.lineTop);
      existing.bottom = Math.max(existing.bottom, glyphBottom);
      existing.left = Math.min(existing.left, glyph.left);
      existing.right = Math.max(existing.right, glyphRight);
      existing.center = existing.top + (existing.bottom - existing.top) / 2;
    }

    return [...lines.values()]
      .map((line) => ({
        ...line,
        glyphs: [...line.glyphs].sort((a, b) => a.left - b.left || a.index - b.index),
      }))
      .sort((a, b) => a.top - b.top || a.left - b.left);
  }

  private rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
    return aStart < bEnd && aEnd > bStart;
  }

  private getCaretOffsetAtPoint(page: PdfViewerPageView, point: Pick<PdfViewerSelectionPoint, 'x' | 'y'>): number {
    const lines = this.getTextLines(page.textGlyphs);

    if (lines.length === 0) {
      return 0;
    }

    const line =
      lines.find((candidate) => point.y >= candidate.top && point.y <= candidate.bottom) ??
      lines.reduce((closest, candidate) =>
        Math.abs(candidate.center - point.y) < Math.abs(closest.center - point.y) ? candidate : closest,
      );
    const glyphs = line.glyphs;

    if (glyphs.length === 0) {
      return 0;
    }

    for (const glyph of glyphs) {
      if (point.x < glyph.left + glyph.width / 2) {
        return glyph.index;
      }
    }

    return glyphs[glyphs.length - 1].index + 1;
  }

  private getSelectionPoint(
    event: PointerEvent | MouseEvent,
    page: PdfViewerPageView,
    surface: HTMLElement,
  ): PdfViewerSelectionPoint {
    const rect = surface.getBoundingClientRect();
    const x = this.clamp(event.clientX - rect.left, 0, page.width);
    const y = this.clamp(event.clientY - rect.top, 0, page.height);

    return {
      pageNumber: page.pageNumber,
      x,
      y,
      offset: this.getCaretOffsetAtPoint(page, { x, y }),
    };
  }

  private getSelectionRects(
    page: PdfViewerPageView,
    startOffset: number,
    endOffset: number,
  ): PdfViewerSelectionRectView[] {
    const rangeStart = Math.min(startOffset, endOffset);
    const rangeEnd = Math.max(startOffset, endOffset);
    const selectedGlyphs = page.textGlyphs.filter((glyph) =>
      glyph.index >= rangeStart && glyph.index < rangeEnd,
    );

    return this.getTextLines(selectedGlyphs).map((line) => {
      const left = this.clamp(line.left - this.textSelectionHorizontalPadding, 0, page.width);
      const top = this.clamp(line.top, 0, page.height);
      const right = this.clamp(line.right + this.textSelectionHorizontalPadding, 0, page.width);
      const bottom = this.clamp(line.bottom, 0, page.height);

      return {
        text: '',
        pageNumber: page.pageNumber,
        left: this.roundCssPixel(left),
        top: this.roundCssPixel(top),
        width: this.roundCssPixel(Math.max(0, right - left)),
        height: this.roundCssPixel(Math.max(0, bottom - top)),
      };
    });
  }

  private async openSource(
    engine: PdfEngine<Blob>,
    documentId: string,
    source: Exclude<PdfViewerSource, null | undefined>,
  ): Promise<PdfDocumentObject> {
    if (typeof source === 'string') {
      const content = await this.fetchPdfSource(source);
      return this.openDocumentBuffer(engine, documentId, content);
    }

    if (source instanceof Blob) {
      return this.openDocumentBuffer(engine, documentId, await source.arrayBuffer());
    }

    if (source instanceof Uint8Array) {
      const content = new Uint8Array(source).buffer;
      return this.openDocumentBuffer(engine, documentId, content);
    }

    return this.openDocumentBuffer(engine, documentId, source);
  }

  private async fetchPdfSource(source: string): Promise<ArrayBuffer> {
    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(`PDF request failed with status ${response.status}`);
    }

    return response.arrayBuffer();
  }

  private openDocumentBuffer(
    engine: PdfEngine<Blob>,
    documentId: string,
    content: ArrayBuffer,
  ): Promise<PdfDocumentObject> {
    return this.withTimeout(
      engine.openDocumentBuffer({ id: documentId, content }).toPromise(),
      this.documentOpenTimeoutMs,
      'PDF document opening timed out',
    );
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);

      promise.then(
        (value) => {
          clearTimeout(timeoutId);
          resolve(value);
        },
        (error: unknown) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      );
    });
  }

  private async closeDocument(): Promise<void> {
    if (!this.engine || !this.pdfDocument) {
      this.pdfDocument = null;
      return;
    }

    const documentToClose = this.pdfDocument;
    this.pdfDocument = null;

    try {
      await this.engine.closeDocument(documentToClose).toPromise();
    } catch {
      // Best-effort cleanup; the viewer should not surface cleanup failures as user-facing load errors.
    }
  }

  private revokeRenderedPages(): void {
    this.disconnectPageObserver();
    this.cancelVisiblePageRenderFrame();

    for (const page of this.renderedPages()) {
      if (page.url) {
        this.revokeObjectUrl(page.url);
      }
    }

    this.renderedPages.set([]);
  }

  private revokeThumbnailPages(): void {
    for (const thumbnail of this.thumbnailPages()) {
      this.revokeObjectUrl(thumbnail.url);
    }

    this.thumbnailPages.set([]);
  }

  private revokeObjectUrl(url: string): void {
    const targetWindow = this.document.defaultView;

    if (targetWindow) {
      targetWindow.URL.revokeObjectURL(url);
      return;
    }

    URL.revokeObjectURL(url);
  }

  private getSourceName(source: PdfViewerSource): string {
    if (typeof File !== 'undefined' && source instanceof File && source.name) {
      return source.name;
    }

    if (typeof source !== 'string' || source.trim().length === 0) {
      return 'Document.pdf';
    }

    try {
      const url = new URL(source, this.document.baseURI);
      const pathName = url.pathname.split('/').filter(Boolean).pop();

      return pathName ? decodeURIComponent(pathName) : 'Document.pdf';
    } catch {
      const pathName = source.split('?')[0]?.split('#')[0]?.split('/').filter(Boolean).pop();

      return pathName ? decodeURIComponent(pathName) : 'Document.pdf';
    }
  }

  private sanitizePage(pageNumber: number): number {
    return this.clamp(Math.trunc(Number.isFinite(pageNumber) ? pageNumber : 1), 1, Math.max(this.pageCount(), 1));
  }

  private sanitizeScale(scale: number): number {
    const bounds = this.getScaleBounds();
    return this.clamp(Number.isFinite(scale) ? scale : 1, bounds.min, bounds.max);
  }

  private roundZoom(value: number): number {
    return this.sanitizeScale(Math.round(this.sanitizeScale(value) * 100) / 100);
  }

  private floorFitZoom(value: number): number {
    return this.sanitizeScale(Math.floor(this.sanitizeScale(value) * 100) / 100);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private roundCssPixel(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private parseCssPixel(value: string): number {
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  private getDevicePixelRatio(): number {
    return this.document.defaultView?.devicePixelRatio || 1;
  }

  private getPageRasterRenderOptions(page: PdfPageObject, scale: number): { scaleFactor: number; dpr: number } {
    const devicePixelRatio = Math.max(1, this.getDevicePixelRatio());
    const pageSize = this.getPageBaseSize(page);
    const maxRenderPixels = this.sanitizePositiveNumber(this.maxRenderPixels(), 128_000_000);
    const maxRenderDimension = this.sanitizePositiveNumber(this.maxRenderDimension(), 13_000);
    const targetEffectiveScale = scale * devicePixelRatio;
    const dimensionEffectiveScale = maxRenderDimension / Math.max(pageSize.width, pageSize.height);
    const pixelEffectiveScale = Math.sqrt(maxRenderPixels / (pageSize.width * pageSize.height));
    const effectiveScale = this.clamp(
      Math.min(targetEffectiveScale, dimensionEffectiveScale, pixelEffectiveScale),
      0.05,
      targetEffectiveScale,
    );
    const dprAtLayoutScale = effectiveScale / scale;

    if (dprAtLayoutScale >= 1) {
      return {
        scaleFactor: scale,
        dpr: this.clamp(dprAtLayoutScale, 1, devicePixelRatio),
      };
    }

    return {
      scaleFactor: effectiveScale,
      dpr: 1,
    };
  }

  private createDocumentId(): string {
    return `ngs-pdf-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private isRenderCurrent(loadToken: number, renderToken: number): boolean {
    return loadToken === this.loadToken && renderToken === this.renderToken;
  }

  private cancelScrollSyncFrame(): void {
    if (this.scrollSyncFrame === null) {
      return;
    }

    this.document.defaultView?.cancelAnimationFrame(this.scrollSyncFrame);
    this.scrollSyncFrame = null;
  }

  private cancelPageObserverFrame(): void {
    if (this.pageObserverTimeout !== null) {
      this.document.defaultView?.clearTimeout(this.pageObserverTimeout);
      this.pageObserverTimeout = null;
    }

    if (this.pageObserverFrame === null) {
      return;
    }

    this.document.defaultView?.cancelAnimationFrame(this.pageObserverFrame);
    this.pageObserverFrame = null;
  }

  private cancelVisiblePageRenderFrame(): void {
    if (this.visiblePageRenderTimeout !== null) {
      this.document.defaultView?.clearTimeout(this.visiblePageRenderTimeout);
      this.visiblePageRenderTimeout = null;
    }

    if (this.visiblePageRenderFrame === null) {
      return;
    }

    this.document.defaultView?.cancelAnimationFrame(this.visiblePageRenderFrame);
    this.visiblePageRenderFrame = null;
  }

  private getCurrentTime(): number {
    return this.document.defaultView?.performance?.now() ?? Date.now();
  }

  private getQualityRenderDelay(): number {
    const elapsed = this.getCurrentTime() - this.lastZoomChangeTime;

    if (elapsed >= this.qualityRenderZoomIdleDelay) {
      return 0;
    }

    return Math.max(0, this.qualityRenderZoomIdleDelay - elapsed);
  }

  private getZoomAnchor(container: HTMLElement, event: WheelEvent): PdfViewerZoomAnchor | null {
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) {
      return null;
    }

    const targetDocument = container.ownerDocument;
    const targetElement = targetDocument.elementFromPoint(event.clientX, event.clientY);
    const pageElement = targetElement?.closest<HTMLElement>('[data-ngs-pdf-page]');

    if (!pageElement || !container.contains(pageElement)) {
      return null;
    }

    const containerRect = container.getBoundingClientRect();
    const pageRect = pageElement.getBoundingClientRect();
    const pageNumber = Number(pageElement.dataset['ngsPdfPage']);

    if (!Number.isFinite(pageNumber) || pageRect.width <= 0 || pageRect.height <= 0) {
      return null;
    }

    return {
      container,
      pageNumber,
      relativeX: this.clamp((event.clientX - pageRect.left) / pageRect.width, 0, 1),
      relativeY: this.clamp((event.clientY - pageRect.top) / pageRect.height, 0, 1),
      viewportX: event.clientX - containerRect.left,
      viewportY: event.clientY - containerRect.top,
    };
  }

  private restoreZoomAnchor(anchor: PdfViewerZoomAnchor | null): void {
    if (!anchor) {
      return;
    }

    const targetWindow = this.document.defaultView;
    const restore = (): void => {
      const pageElement = anchor.container.querySelector<HTMLElement>(`[data-ngs-pdf-page="${anchor.pageNumber}"]`);

      if (!pageElement) {
        return;
      }

      const containerRect = anchor.container.getBoundingClientRect();
      const pageRect = pageElement.getBoundingClientRect();
      const targetLeft =
        anchor.container.scrollLeft +
        pageRect.left -
        containerRect.left +
        pageRect.width * anchor.relativeX -
        anchor.viewportX;
      const targetTop =
        anchor.container.scrollTop +
        pageRect.top -
        containerRect.top +
        pageRect.height * anchor.relativeY -
        anchor.viewportY;

      anchor.container.scrollLeft = this.clamp(targetLeft, 0, Math.max(0, anchor.container.scrollWidth - anchor.container.clientWidth));
      anchor.container.scrollTop = this.clamp(targetTop, 0, Math.max(0, anchor.container.scrollHeight - anchor.container.clientHeight));
    };

    if (!targetWindow) {
      restore();
      return;
    }

    targetWindow.requestAnimationFrame(restore);
  }

  private disconnectPageObserver(): void {
    this.cancelPageObserverFrame();
    this.pageIntersectionObserver?.disconnect();
    this.pageIntersectionObserver = null;
    this.visiblePageRatios.clear();
  }

  private schedulePageObserverRefresh(): void {
    const targetWindow = this.document.defaultView;

    if (!this.isBrowser || !targetWindow) {
      return;
    }

    this.cancelPageObserverFrame();
    this.pageObserverRefreshAttempts = 0;
    this.scheduleNextPageObserverRefresh();
  }

  private scheduleNextPageObserverRefresh(): void {
    const targetWindow = this.document.defaultView;

    if (!targetWindow) {
      return;
    }

    this.pageObserverTimeout = targetWindow.setTimeout(() => {
      this.pageObserverTimeout = null;
      this.pageObserverFrame = targetWindow.requestAnimationFrame(() => {
        this.pageObserverFrame = null;
        const isReady = this.setupPageIntersectionObserver();

        if (!isReady && this.pageObserverRefreshAttempts < 10) {
          this.pageObserverRefreshAttempts++;
          this.scheduleNextPageObserverRefresh();
          return;
        }

        this.syncActivePageFromViewport();
      });
    }, 0);
  }

  private setupPageIntersectionObserver(): boolean {
    const targetWindow = this.document.defaultView;
    const container = this.viewerBody()?.nativeElement;

    if (!targetWindow || !container || !('IntersectionObserver' in targetWindow)) {
      return false;
    }

    const pages = Array.from(container.querySelectorAll<HTMLElement>('[data-ngs-pdf-page]'));

    if (pages.length === 0) {
      return false;
    }

    this.pageIntersectionObserver?.disconnect();
    this.visiblePageRatios.clear();
    this.pageIntersectionObserver = new targetWindow.IntersectionObserver((entries) => {
      if (this.isProgrammaticScrollActive()) {
        this.scheduleCurrentVisiblePagesRender();
        return;
      }

      for (const entry of entries) {
        const pageNumber = Number(entry.target.getAttribute('data-ngs-pdf-page'));

        if (!Number.isFinite(pageNumber)) {
          continue;
        }

        this.visiblePageRatios.set(pageNumber, entry.intersectionRatio);
      }

      this.syncActivePageFromIntersections();
      this.scheduleCurrentVisiblePagesRender();
    }, {
      root: container,
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    });

    for (const page of pages) {
      this.pageIntersectionObserver.observe(page);
    }

    return true;
  }

  private getFitScale(mode: Extract<PdfViewerZoomMode, 'fit-page' | 'fit-width'>): number | null {
    const container = this.viewerBody()?.nativeElement;
    const page = this.pdfDocument?.pages[this.clamp(this.activePage(), 1, Math.max(this.pageCount(), 1)) - 1];

    if (!container || !page) {
      return null;
    }

    const pageSize = this.getPageBaseSize(page);
    const pagesElement = container.querySelector<HTMLElement>('.pdf-viewer-pages');
    const computedStyle = pagesElement && this.document.defaultView
      ? this.document.defaultView.getComputedStyle(pagesElement)
      : null;
    const horizontalPadding = computedStyle
      ? this.parseCssPixel(computedStyle.paddingLeft) + this.parseCssPixel(computedStyle.paddingRight)
      : 0;
    const verticalPadding = computedStyle
      ? this.parseCssPixel(computedStyle.paddingTop) + this.parseCssPixel(computedStyle.paddingBottom)
      : 0;
    const fitAllowance = 1;
    const availableWidth = Math.max(1, container.clientWidth - horizontalPadding - fitAllowance);
    const availableHeight = Math.max(1, container.clientHeight - verticalPadding - fitAllowance);
    const widthScale = availableWidth / pageSize.width;

    if (mode === 'fit-width') {
      return this.floorFitZoom(widthScale);
    }

    return this.floorFitZoom(Math.min(widthScale, availableHeight / pageSize.height));
  }

  private getScaleBounds(): { min: number; max: number } {
    const min = this.sanitizePositiveNumber(this.minScale(), 0.2);
    const max = this.sanitizePositiveNumber(this.maxScale(), 60);

    return min <= max ? { min, max } : { min: max, max: min };
  }

  private sanitizeZoomStep(): number {
    return this.sanitizePositiveNumber(this.zoomStep(), 0.1);
  }

  private sanitizePositiveNumber(value: number, fallback: number): number {
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private getPageDisplaySize(page: PdfPageObject, scale: number): { width: number; height: number } {
    const pageSize = this.getPageBaseSize(page);

    return {
      width: Math.max(1, Math.round(pageSize.width * scale)),
      height: Math.max(1, Math.round(pageSize.height * scale)),
    };
  }

  private getPageBaseSize(page: PdfPageObject): { width: number; height: number } {
    const rotation = this.getPageDisplayRotation(page);
    const isRotatedSideways = rotation === Rotation.Degree90 || rotation === Rotation.Degree270;
    const width = isRotatedSideways ? page.size.height : page.size.width;
    const height = isRotatedSideways ? page.size.width : page.size.height;

    return {
      width: Math.max(1, width),
      height: Math.max(1, height),
    };
  }

  private getPageDisplayRotation(page: PdfPageObject): Rotation {
    return this.normalizeRotation(page.rotation + this.pageRotation());
  }

  private normalizeRotation(rotation: number): Rotation {
    return (((rotation % 4) + 4) % 4) as Rotation;
  }

  private scrollToPage(pageNumber: number): void {
    if (!this.renderAll()) {
      return;
    }

    const container = this.viewerBody()?.nativeElement;
    const target = container?.querySelector<HTMLElement>(`[data-ngs-pdf-page="${pageNumber}"]`);

    if (!container || !target) {
      return;
    }

    const nextScrollTop = this.getPageScrollTop(container, target);
    const nextScrollLeft = this.getPageScrollLeft(container, target);
    const scrollDistance = Math.hypot(
      container.scrollTop - nextScrollTop,
      container.scrollLeft - nextScrollLeft,
    );

    this.startProgrammaticScrollLock(pageNumber, scrollDistance);
    container.scrollTo({
      top: nextScrollTop,
      left: nextScrollLeft,
      behavior: 'smooth',
    });
  }

  private syncActivePageFromViewport(): void {
    const pageNumber = this.findActivePageInViewport();

    this.activatePageFromScroll(pageNumber);
  }

  private syncActivePageFromIntersections(): void {
    let activePage: number | null = null;
    let activeRatio = 0;

    for (const [pageNumber, ratio] of this.visiblePageRatios) {
      if (ratio > activeRatio) {
        activeRatio = ratio;
        activePage = pageNumber;
      }
    }

    if (!activePage) {
      activePage = this.findActivePageInViewport();
    }

    this.activatePageFromScroll(activePage);
  }

  private activatePageFromScroll(pageNumber: number | null): void {
    if (this.isProgrammaticScrollActive()) {
      return;
    }

    if (!pageNumber || pageNumber === this.activePage()) {
      return;
    }

    this.activePage.set(pageNumber);
    this.pageChanged.emit(pageNumber);
    this.scrollPageListToPage(pageNumber);
    this.scheduleCurrentVisiblePagesRender();
  }

  private findActivePageInViewport(): number | null {
    const container = this.viewerBody()?.nativeElement;

    if (!container) {
      return null;
    }

    const containerRect = container.getBoundingClientRect();
    const viewportCenterX = containerRect.left + containerRect.width / 2;
    const viewportCenterY = containerRect.top + containerRect.height / 2;
    const pages = Array.from(container.querySelectorAll<HTMLElement>('[data-ngs-pdf-page]'));

    let closestPage: number | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    let mostVisiblePage: number | null = null;
    let mostVisibleArea = 0;

    for (const page of pages) {
      const rect = page.getBoundingClientRect();
      const pageNumber = Number(page.dataset['ngsPdfPage']);

      if (!Number.isFinite(pageNumber)) {
        continue;
      }

      if (
        rect.left <= viewportCenterX &&
        rect.right >= viewportCenterX &&
        rect.top <= viewportCenterY &&
        rect.bottom >= viewportCenterY
      ) {
        return pageNumber;
      }

      const visibleWidth = Math.max(0, Math.min(rect.right, containerRect.right) - Math.max(rect.left, containerRect.left));
      const visibleHeight = Math.max(0, Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top));
      const visibleArea = visibleWidth * visibleHeight;

      if (visibleArea > mostVisibleArea) {
        mostVisibleArea = visibleArea;
        mostVisiblePage = pageNumber;
      }

      const pageCenterX = rect.left + rect.width / 2;
      const pageCenterY = rect.top + rect.height / 2;
      const distance = Math.hypot(pageCenterX - viewportCenterX, pageCenterY - viewportCenterY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPage = pageNumber;
      }
    }

    return mostVisiblePage ?? closestPage;
  }

  private scrollPageListToPage(pageNumber: number): void {
    const container = this.pageList()?.nativeElement;
    const target = container?.querySelector<HTMLElement>(`[data-ngs-pdf-page-button="${pageNumber}"]`);

    if (!container || !target) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const isAbove = targetRect.top < containerRect.top;
    const isBelow = targetRect.bottom > containerRect.bottom;

    if (!isAbove && !isBelow) {
      return;
    }

    container.scrollTo({
      top: this.getElementScrollTop(container, target, 'center'),
      behavior: 'smooth',
    });
  }

  private getPageScrollTop(container: HTMLElement, target: HTMLElement): number {
    return this.getElementScrollTop(container, target, 'start');
  }

  private getPageScrollLeft(container: HTMLElement, target: HTMLElement): number {
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetLeft = container.scrollLeft + targetRect.left - containerRect.left;

    return this.clamp(targetLeft, 0, Math.max(0, container.scrollWidth - container.clientWidth));
  }

  private getElementScrollTop(container: HTMLElement, target: HTMLElement, align: 'start' | 'center'): number {
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTop = container.scrollTop + targetRect.top - containerRect.top;
    const alignedTop = align === 'center'
      ? targetTop - container.clientHeight / 2 + targetRect.height / 2
      : targetTop;

    return this.clamp(alignedTop, 0, Math.max(0, container.scrollHeight - container.clientHeight));
  }

  private getProgrammaticScrollTimeout(distance: number): number {
    return this.clamp(
      this.programmaticScrollMinDuration + distance * 0.45,
      this.programmaticScrollMinDuration,
      this.programmaticScrollMaxDuration,
    );
  }

  private startProgrammaticScrollLock(pageNumber: number, distance: number): void {
    const targetWindow = this.document.defaultView;

    if (!targetWindow) {
      return;
    }

    this.clearProgrammaticScrollLock();
    this.programmaticScrollTargetPage = pageNumber;
    this.programmaticScrollTimeout = targetWindow.setTimeout(() => {
      this.programmaticScrollTimeout = null;
      this.completeProgrammaticScroll();
    }, this.getProgrammaticScrollTimeout(distance));
  }

  private isProgrammaticScrollActive(): boolean {
    return this.programmaticScrollTargetPage !== null;
  }

  private completeProgrammaticScrollIfSettled(): void {
    const pageNumber = this.programmaticScrollTargetPage;

    if (pageNumber === null) {
      return;
    }

    const container = this.viewerBody()?.nativeElement;
    const target = container?.querySelector<HTMLElement>(`[data-ngs-pdf-page="${pageNumber}"]`);

    if (!container || !target) {
      this.completeProgrammaticScroll();
      return;
    }

    if (
      Math.abs(container.scrollTop - this.getPageScrollTop(container, target)) <= 2 &&
      Math.abs(container.scrollLeft - this.getPageScrollLeft(container, target)) <= 2
    ) {
      this.completeProgrammaticScroll();
    }
  }

  private completeProgrammaticScroll(): void {
    const pageNumber = this.programmaticScrollTargetPage;

    this.clearProgrammaticScrollLock();

    if (pageNumber === null) {
      return;
    }

    if (pageNumber !== this.activePage()) {
      this.activePage.set(pageNumber);
      this.pageChanged.emit(pageNumber);
    }

    this.scrollPageListToPage(pageNumber);
  }

  private clearProgrammaticScrollLock(): void {
    if (this.programmaticScrollTimeout !== null) {
      this.document.defaultView?.clearTimeout(this.programmaticScrollTimeout);
      this.programmaticScrollTimeout = null;
    }

    this.programmaticScrollTargetPage = null;
  }
}
