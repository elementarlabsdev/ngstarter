import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
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
import type { PdfDocumentObject, PdfEngine, PdfPageObject } from '@embedpdf/models';
import { BlockLoader } from '@ngstarter-ui/components/block-loader';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelSidebar,
} from '@ngstarter-ui/components/panel';
import { PdfViewerEngineService } from './pdf-viewer-engine.service';
import {
  PdfViewerLoadedEvent,
  PdfViewerPageRenderedEvent,
  PdfViewerThumbnailView,
  PdfViewerPageView,
  PdfViewerSelectionRectView,
  PdfViewerSource,
  PdfViewerTextGlyphView,
} from './types';

interface PdfViewerPageListItem {
  pageNumber: number;
  thumbnail: PdfViewerThumbnailView | null;
}

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

@Component({
  selector: 'ngs-pdf-viewer',
  exportAs: 'ngsPdfViewer',
  standalone: true,
  imports: [
    BlockLoader,
    Button,
    Icon,
    Panel,
    PanelContent,
    PanelHeader,
    PanelSidebar,
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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly viewerBody = viewChild<ElementRef<HTMLElement>>('viewerBody');
  private readonly pageList = viewChild<ElementRef<HTMLElement>>('pageList');

  src = input<PdfViewerSource>(null);
  wasmUrl = input('/assets/embedpdf/pdfium.wasm');
  page = input(1, { transform: numberAttribute });
  scale = input(1, { transform: numberAttribute });
  minScale = input(0.2, { transform: numberAttribute });
  maxScale = input(60, { transform: numberAttribute });
  zoomStep = input(0.1, { transform: numberAttribute });
  renderAll = input(true, { transform: booleanAttribute });
  showToolbar = input(true, { transform: booleanAttribute });
  showPageList = input(true, { transform: booleanAttribute });
  showPageNumbers = input(true, { transform: booleanAttribute });
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
  protected readonly uploadedSource = signal<Blob | null>(null);
  protected readonly pageListVisible = signal(true);
  protected readonly selectionRects = signal<PdfViewerSelectionRectView[]>([]);
  protected readonly hasDocument = computed(() => this.pageCount() > 0);
  protected readonly effectiveSource = computed(() => this.uploadedSource() ?? this.src());
  protected readonly isPageListVisible = computed(() =>
    this.showPageList() && this.hasDocument() && this.pageListVisible(),
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

  private engine: PdfEngine<Blob> | null = null;
  private pdfDocument: PdfDocumentObject | null = null;
  private registry: { destroy(): Promise<void> | void } | null = null;
  private pageIntersectionObserver: IntersectionObserver | null = null;
  private visiblePageRatios = new Map<number, number>();
  private loadToken = 0;
  private scrollSyncFrame: number | null = null;
  private programmaticScrollTargetPage: number | null = null;
  private programmaticScrollTimeout: number | null = null;
  private pageObserverFrame: number | null = null;
  private pageObserverTimeout: number | null = null;
  private pageObserverRefreshAttempts = 0;
  private selectionStart: PdfViewerSelectionPoint | null = null;
  private isViewInitialized = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.loadToken++;
      this.cancelScrollSyncFrame();
      this.clearProgrammaticScrollLock();
      this.cancelPageObserverFrame();
      this.disconnectPageObserver();
      this.revokeRenderedPages();
      this.revokeThumbnailPages();
      void this.closeDocument();
      void this.registry?.destroy();
    });

    effect(() => {
      const source = this.effectiveSource();
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
        this.zoom.set(scale);
      }
    });

    effect(() => {
      const requestedPage = this.sanitizePage(this.page());

      if (requestedPage !== untracked(() => this.activePage())) {
        this.activePage.set(requestedPage);
      }
    });

    effect(() => {
      const zoom = this.zoom();
      const renderAll = this.renderAll();
      const activePage = renderAll ? untracked(() => this.activePage()) : this.activePage();
      const withAnnotations = this.withAnnotations();
      const withForms = this.withForms();

      if (!this.pdfDocument || !this.engine || this.isLoading()) {
        return;
      }

      untracked(() => {
        void this.renderPages(this.loadToken, { zoom, activePage, renderAll, withAnnotations, withForms });
      });
    });

    effect(() => {
      const withAnnotations = this.withAnnotations();
      const isLoading = this.isLoading();
      const pageCount = this.pageCount();

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
      void this.loadDocument(this.effectiveSource(), this.wasmUrl());
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
    this.zoom.set(this.roundZoom(this.zoom() + this.sanitizeZoomStep()));
  }

  zoomOut(): void {
    this.zoom.set(this.roundZoom(this.zoom() - this.sanitizeZoomStep()));
  }

  togglePageList(): void {
    this.pageListVisible.update((isVisible) => !isVisible);
  }

  protected onPdfFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.item(0);
    inputElement.value = '';

    if (!file) {
      return;
    }

    this.activePage.set(1);
    this.uploadedSource.set(file);
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
    }) ?? null;
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

  protected cancelTextSelection(): void {
    this.selectionStart = null;
  }

  private async loadDocument(source: PdfViewerSource, wasmUrl: string): Promise<void> {
    const token = ++this.loadToken;
    this.isLoading.set(true);
    this.errorState.set(null);
    this.pageCount.set(0);
    this.selectionStart = null;
    this.selectionRects.set([]);
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

      await this.renderPages(token, {
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

  private async renderPages(
    token: number,
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
    const pages = options.renderAll
      ? pdfDocument.pages
      : [pdfDocument.pages[this.clamp(options.activePage, 1, pdfDocument.pageCount) - 1]].filter(Boolean);
    const nextPages: PdfViewerPageView[] = [];
    const previousPages = this.renderedPages();

    const renderScale = this.sanitizeScale(options.zoom);
    this.selectionStart = null;
    this.selectionRects.set([]);

    for (const page of pages) {
      const blob = await this.engine.renderPage(pdfDocument, page, {
        scaleFactor: renderScale,
        dpr: this.getDevicePixelRatio(),
        withAnnotations: options.withAnnotations,
        withForms: options.withForms,
      }).toPromise();

      if (token !== this.loadToken) {
        this.document.defaultView?.URL.revokeObjectURL(this.document.defaultView.URL.createObjectURL(blob));
        return;
      }

      const url = this.document.defaultView?.URL.createObjectURL(blob) ?? URL.createObjectURL(blob);
      const pageNumber = page.index + 1;
      const displaySize = this.getPageDisplaySize(page, renderScale);
      const textGlyphs = await this.getPageTextGlyphs(pdfDocument, page, renderScale);
      nextPages.push({ pageNumber, url, width: displaySize.width, height: displaySize.height, textGlyphs });
      this.pageRendered.emit({ pageNumber, url, width: displaySize.width, height: displaySize.height });
    }

    if (token !== this.loadToken) {
      for (const page of nextPages) {
        this.revokeObjectUrl(page.url);
      }
      return;
    }

    this.disconnectPageObserver();
    this.renderedPages.set(nextPages);
    this.schedulePageObserverRefresh();

    for (const page of previousPages) {
      this.revokeObjectUrl(page.url);
    }
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
      return engine.openDocumentUrl({ id: documentId, url: source }).toPromise();
    }

    if (source instanceof Blob) {
      return engine.openDocumentBuffer({ id: documentId, content: await source.arrayBuffer() }).toPromise();
    }

    if (source instanceof Uint8Array) {
      const content = new Uint8Array(source).buffer;
      return engine.openDocumentBuffer({ id: documentId, content }).toPromise();
    }

    return engine.openDocumentBuffer({ id: documentId, content: source }).toPromise();
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

    for (const page of this.renderedPages()) {
      this.revokeObjectUrl(page.url);
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

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private roundCssPixel(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private getDevicePixelRatio(): number {
    return this.document.defaultView?.devicePixelRatio || 1;
  }

  private createDocumentId(): string {
    return `ngs-pdf-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    }, {
      root: container,
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    });

    for (const page of pages) {
      this.pageIntersectionObserver.observe(page);
    }

    return true;
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
    const isRotatedSideways = page.rotation === 1 || page.rotation === 3;
    const width = isRotatedSideways ? page.size.height : page.size.width;
    const height = isRotatedSideways ? page.size.width : page.size.height;

    return {
      width: Math.max(1, Math.round(width * scale)),
      height: Math.max(1, Math.round(height * scale)),
    };
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

    this.startProgrammaticScrollLock(pageNumber);
    container.scrollTo({
      top: target.offsetTop,
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
  }

  private findActivePageInViewport(): number | null {
    const container = this.viewerBody()?.nativeElement;

    if (!container) {
      return null;
    }

    const containerRect = container.getBoundingClientRect();
    const viewportCenter = containerRect.top + containerRect.height / 2;
    const pages = Array.from(container.querySelectorAll<HTMLElement>('[data-ngs-pdf-page]'));

    let closestPage: number | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    let mostVisiblePage: number | null = null;
    let mostVisibleHeight = 0;

    for (const page of pages) {
      const rect = page.getBoundingClientRect();
      const pageNumber = Number(page.dataset['ngsPdfPage']);

      if (!Number.isFinite(pageNumber)) {
        continue;
      }

      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        return pageNumber;
      }

      const visibleHeight = Math.max(0, Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top));

      if (visibleHeight > mostVisibleHeight) {
        mostVisibleHeight = visibleHeight;
        mostVisiblePage = pageNumber;
      }

      const distance = Math.min(Math.abs(rect.top - viewportCenter), Math.abs(rect.bottom - viewportCenter));

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
      top: target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2,
      behavior: 'smooth',
    });
  }

  private startProgrammaticScrollLock(pageNumber: number): void {
    const targetWindow = this.document.defaultView;

    if (!targetWindow) {
      return;
    }

    this.clearProgrammaticScrollLock();
    this.programmaticScrollTargetPage = pageNumber;
    this.programmaticScrollTimeout = targetWindow.setTimeout(() => {
      this.programmaticScrollTimeout = null;
      this.completeProgrammaticScroll();
    }, 900);
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

    if (Math.abs(container.scrollTop - target.offsetTop) <= 2) {
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
