import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PdfViewerAnnotationDef } from '../pdf-viewer-annotation-def.directive';
import { PdfViewer } from './pdf-viewer';

@Component({
  selector: 'ngs-pdf-viewer-annotation-test-host',
  standalone: true,
  imports: [PdfViewer, PdfViewerAnnotationDef],
  template: `
    <ngs-pdf-viewer [showAnnotationsPanel]="true" [annotationsDataSource]="annotations">
      <ng-template ngsPdfViewerAnnotation="risk" let-annotation>
        <strong class="risk-template">{{ annotation.text }}</strong>
      </ng-template>
      <ng-template ngsPdfViewerAnnotation let-annotation>
        <span class="default-template">{{ annotation.text }}</span>
      </ng-template>
    </ngs-pdf-viewer>
  `,
})
class PdfViewerAnnotationTestHost {
  annotations = [
    {
      id: 'risk',
      type: 'risk',
      author: 'Alex',
      text: 'Risk note',
      pageNumber: 1,
    },
    {
      id: 'comment',
      type: 'comment',
      author: 'Maya',
      text: 'Comment note',
      pageNumber: 2,
    },
  ];
}

describe('PdfViewer', () => {
  let fixture: ComponentFixture<PdfViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfViewer],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfViewer);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render every page by default', () => {
    const component = fixture.componentInstance as unknown as {
      renderAll: { (): boolean };
    };

    expect(component.renderAll()).toBe(true);
  });

  it('should keep selected page active during programmatic scroll', () => {
    const component = fixture.componentInstance as unknown as {
      activePage: { set(value: number): void; (): number };
      programmaticScrollTargetPage: number | null;
      activatePageFromScroll(pageNumber: number): void;
    };

    component.activePage.set(2);
    component.programmaticScrollTargetPage = 2;
    component.activatePageFromScroll(1);

    expect(component.activePage()).toBe(2);

    component.programmaticScrollTargetPage = null;
    component.activatePageFromScroll(1);

    expect(component.activePage()).toBe(1);
  });

  it('should resize page shells immediately on zoom and keep stale images as previews', () => {
    const component = fixture.componentInstance as unknown as {
      pdfDocument: unknown;
      renderedPages: {
        set(value: unknown[]): void;
        (): Array<{
          scale: number;
          url: string | null;
          rotation?: number;
          renderedRotation?: number | null;
          width: number;
          height: number;
          textGlyphs: unknown[];
        }>;
      };
      setZoom(scale: number): void;
    };
    component.pdfDocument = {
      pageCount: 1,
      pages: [
        {
          index: 0,
          rotation: 0,
          size: {
            width: 100,
            height: 200,
          },
        },
      ],
    };

    component.renderedPages.set([
      {
        pageNumber: 1,
        url: 'blob:page-1',
        scale: 1,
        renderedScale: 1,
        rotation: 0,
        renderedRotation: 0,
        width: 100,
        height: 200,
        isRendering: false,
        textGlyphs: [
          {
            index: 0,
            left: 10,
            top: 20,
            width: 30,
            height: 40,
            lineTop: 18,
            lineHeight: 48,
            lineId: 0,
          },
        ],
      },
    ]);

    component.setZoom(2);

    expect(component.renderedPages()[0].scale).toBe(2);
    expect(component.renderedPages()[0].url).toBe('blob:page-1');
    expect(component.renderedPages()[0].rotation).toBe(0);
    expect(component.renderedPages()[0].renderedRotation).toBe(0);
    expect(component.renderedPages()[0].width).toBe(200);
    expect(component.renderedPages()[0].height).toBe(400);
    expect(component.renderedPages()[0].textGlyphs).toEqual([]);
  });

  it('should group rendered pages into the selected spread mode', () => {
    const component = fixture.componentInstance as unknown as {
      pageSpreads: {
        (): Array<{
          leadingPlaceholder: boolean;
          pages: Array<{ pageNumber: number }>;
        }>;
      };
      renderedPages: { set(value: unknown[]): void };
      setSpreadMode(mode: 'single' | 'two-odd' | 'two-even'): void;
    };
    const pages = [1, 2, 3, 4].map((pageNumber) => ({
      pageNumber,
      url: null,
      scale: 1,
      renderedScale: null,
      rotation: 0,
      renderedRotation: null,
      width: 100,
      height: 200,
      isRendering: false,
      textGlyphs: [],
    }));

    component.renderedPages.set(pages);

    expect(component.pageSpreads().map((spread) => spread.pages.map((page) => page.pageNumber))).toEqual([[1], [2], [3], [4]]);

    component.setSpreadMode('two-odd');
    expect(component.pageSpreads().map((spread) => spread.pages.map((page) => page.pageNumber))).toEqual([[1, 2], [3, 4]]);

    component.setSpreadMode('two-even');
    expect(component.pageSpreads().map((spread) => spread.pages.map((page) => page.pageNumber))).toEqual([[1], [2, 3], [4]]);
    expect(component.pageSpreads()[0].leadingPlaceholder).toBe(true);
  });

  it('should rotate pages by invalidating stale page renders and swapping display size', () => {
    const component = fixture.componentInstance as unknown as {
      pdfDocument: unknown;
      pageRotation: { (): number };
      renderedPages: {
        set(value: unknown[]): void;
        (): Array<{
          url: string | null;
          width: number;
          height: number;
          rotation?: number;
          renderedRotation?: number | null;
        }>;
      };
      rotateClockwise(): void;
      rotateCounterClockwise(): void;
    };
    component.pdfDocument = {
      pageCount: 1,
      pages: [
        {
          index: 0,
          rotation: 0,
          size: {
            width: 100,
            height: 200,
          },
        },
      ],
    };
    component.renderedPages.set([
      {
        pageNumber: 1,
        url: 'blob:page-1',
        scale: 1,
        renderedScale: 1,
        rotation: 0,
        renderedRotation: 0,
        width: 100,
        height: 200,
        isRendering: false,
        textGlyphs: [],
      },
    ]);

    component.rotateClockwise();
    fixture.detectChanges();

    expect(component.pageRotation()).toBe(1);
    expect(component.renderedPages()[0].url).toBeNull();
    expect(component.renderedPages()[0].rotation).toBe(1);
    expect(component.renderedPages()[0].renderedRotation).toBeNull();
    expect(component.renderedPages()[0].width).toBe(200);
    expect(component.renderedPages()[0].height).toBe(100);

    component.rotateCounterClockwise();
    fixture.detectChanges();

    expect(component.pageRotation()).toBe(0);
    expect(component.renderedPages()[0].rotation).toBe(0);
    expect(component.renderedPages()[0].width).toBe(100);
    expect(component.renderedPages()[0].height).toBe(200);
  });

  it('should keep default raster render scale sharp at 1600 percent for document pages', () => {
    const component = fixture.componentInstance as unknown as {
      getPageRasterRenderOptions(page: unknown, scale: number): { scaleFactor: number; dpr: number };
    };

    const options = component.getPageRasterRenderOptions({
      index: 0,
      rotation: 0,
      size: {
        width: 612,
        height: 792,
      },
    }, 16);

    expect(options.scaleFactor).toBe(16);
    expect(options.scaleFactor * options.dpr).toBeGreaterThanOrEqual(16);
  });

  it('should delay quality page rendering while zoom is still changing', async () => {
    const component = fixture.componentInstance as unknown as {
      getCurrentTime(): number;
      lastZoomChangeTime: number;
      renderVisiblePages(): Promise<void>;
      scheduleVisiblePagesRender(options: {
        zoom: number;
        activePage: number;
        renderAll: boolean;
        withAnnotations: boolean;
        withForms: boolean;
      }): void;
    };
    let renderCount = 0;

    component.renderVisiblePages = () => {
      renderCount++;
      return Promise.resolve();
    };
    component.lastZoomChangeTime = component.getCurrentTime();
    component.scheduleVisiblePagesRender({
      zoom: 2,
      activePage: 1,
      renderAll: true,
      withAnnotations: true,
      withForms: true,
    });

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(renderCount).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 200));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(renderCount).toBe(1);
  });

  it('should zoom with command wheel gestures', () => {
    const component = fixture.componentInstance as unknown as {
      pdfDocument: unknown;
      zoom: { (): number };
      onViewerWheel(event: WheelEvent): void;
    };
    let prevented = false;
    let stopped = false;

    component.pdfDocument = { pageCount: 1, pages: [] };
    component.onViewerWheel({
      metaKey: true,
      ctrlKey: false,
      deltaY: -100,
      deltaX: 0,
      clientX: 0,
      clientY: 0,
      preventDefault: () => {
        prevented = true;
      },
      stopPropagation: () => {
        stopped = true;
      },
    } as WheelEvent);

    expect(prevented).toBe(true);
    expect(stopped).toBe(true);
    expect(component.zoom()).toBeGreaterThan(1);
  });

  it('should floor fit zoom values so fit-to-width does not overflow horizontally', () => {
    const component = fixture.componentInstance as unknown as {
      floorFitZoom(value: number): number;
    };

    expect(component.floorFitZoom(1.309)).toBe(1.3);
  });

  it('should render annotations from the configured data source', () => {
    fixture.componentRef.setInput('showAnnotationsPanel', true);
    fixture.componentRef.setInput('annotationsDataSource', [
      {
        id: 'review',
        author: 'Alex',
        text: 'Review this section',
        pageNumber: 1,
      },
    ]);

    const component = fixture.componentInstance as unknown as {
      annotationsPanelVisible: { set(value: boolean): void };
    };
    component.annotationsPanelVisible.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Review this section');
  });

  it('should keep user-opened panels visible while the document is resetting during load', () => {
    fixture.componentRef.setInput('showAnnotationsPanel', true);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      annotationsPanelVisible: { set(value: boolean): void };
      isAnnotationsPanelVisible: { (): boolean };
      isPageListVisible: { (): boolean };
      isSearchPanelVisible: { (): boolean };
      pageCount: { set(value: number): void };
      pageListVisible: { set(value: boolean): void };
      searchPanelVisible: { set(value: boolean): void };
    };

    component.pageCount.set(3);
    component.pageListVisible.set(true);
    fixture.detectChanges();

    expect(component.isPageListVisible()).toBe(true);
    expect(fixture.nativeElement.querySelector('ngs-panel-sidebar')).not.toBeNull();

    component.searchPanelVisible.set(true);
    fixture.detectChanges();

    expect(component.isSearchPanelVisible()).toBe(true);
    expect(fixture.nativeElement.querySelector('ngs-panel-aside')).not.toBeNull();

    component.searchPanelVisible.set(false);
    component.annotationsPanelVisible.set(true);
    fixture.detectChanges();

    expect(component.isAnnotationsPanelVisible()).toBe(true);
    expect(fixture.nativeElement.querySelector('ngs-panel-aside')).not.toBeNull();

    component.pageCount.set(0);
    fixture.detectChanges();

    expect(component.isPageListVisible()).toBe(true);
    expect(component.isAnnotationsPanelVisible()).toBe(true);
    expect(fixture.nativeElement.querySelector('ngs-panel-sidebar')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('ngs-panel-aside')).not.toBeNull();
  });

  it('should wait until the aside controls are interactive before opening panels', () => {
    fixture.componentRef.setInput('showAnnotationsPanel', true);
    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      asidePanelInteractive: { set(value: boolean): void };
    };
    const getButton = (label: string) =>
      fixture.nativeElement.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;

    component.asidePanelInteractive.set(false);
    fixture.detectChanges();

    expect(getButton('Search').disabled).toBe(true);
    expect(getButton('Toggle annotations panel').disabled).toBe(true);

    component.asidePanelInteractive.set(true);
    fixture.detectChanges();

    expect(getButton('Search').disabled).toBe(false);
    expect(getButton('Toggle annotations panel').disabled).toBe(false);
  });

  it('should render search results returned by the PDF engine', async () => {
    const component = fixture.componentInstance as unknown as {
      engine: unknown;
      pdfDocument: unknown;
      searchPanelVisible: { set(value: boolean): void };
      updatePdfSearch(event: { query: string; options: { caseSensitive: boolean; wholeWord: boolean } }): Promise<void> | void;
    };

    component.engine = {
      searchAllPages: () => ({
        toPromise: () => Promise.resolve({
          results: [
            {
              pageIndex: 0,
              charIndex: 12,
              charCount: 2,
              rects: [],
              context: {
                before: 'We need to',
                match: 'review',
                after: 'this section',
                truncatedLeft: false,
                truncatedRight: false,
              },
            },
          ],
        }),
      }),
    };
    component.pdfDocument = { pageCount: 1 };
    component.searchPanelVisible.set(true);

    await component.updatePdfSearch({
      query: 'review',
      options: {
        caseSensitive: false,
        wholeWord: false,
      },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('1 result found');
    expect(fixture.nativeElement.textContent).toContain('We need to');
    expect(fixture.nativeElement.textContent).toContain('review');
    expect(fixture.nativeElement.textContent).toContain('this section');
  });

  it('should open search with an empty query when searchQuery input is empty', () => {
    const component = fixture.componentInstance as unknown as {
      activeSearchQuery: { set(value: string): void; (): string };
      pdfSearchResults: { set(value: unknown[]): void; (): unknown[] };
      searchPanelVisible: { (): boolean };
      toggleSearchPanel(): void;
    };

    component.activeSearchQuery.set('we');
    component.pdfSearchResults.set([{ pageNumber: 1, excerpt: 'we found text' }]);
    component.toggleSearchPanel();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('ngs-pdf-viewer-search input') as HTMLInputElement;

    expect(component.searchPanelVisible()).toBe(true);
    expect(component.activeSearchQuery()).toBe('');
    expect(component.pdfSearchResults()).toEqual([]);
    expect(searchInput.value).toBe('');
    expect(fixture.nativeElement.textContent).not.toContain('0 results found');
    expect(fixture.nativeElement.textContent).not.toContain('No results.');
  });

  it('should clear a typed search query after closing and reopening search', () => {
    const component = fixture.componentInstance as unknown as {
      activeSearchQuery: { (): string };
      closeAsidePanel(): void;
      toggleSearchPanel(): void;
    };

    component.toggleSearchPanel();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('ngs-pdf-viewer-search input') as HTMLInputElement;
    searchInput.value = 'we';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.activeSearchQuery()).toBe('we');

    component.closeAsidePanel();
    fixture.detectChanges();
    component.toggleSearchPanel();
    fixture.detectChanges();

    const reopenedSearchInput = fixture.nativeElement.querySelector('ngs-pdf-viewer-search input') as HTMLInputElement;
    expect(component.activeSearchQuery()).toBe('');
    expect(reopenedSearchInput.value).toBe('');
  });

  it('should select annotation templates with when and fall back to the default annotation template', () => {
    const hostFixture = TestBed.createComponent(PdfViewerAnnotationTestHost);
    hostFixture.detectChanges();

    const viewer = hostFixture.debugElement.query(By.directive(PdfViewer)).componentInstance as unknown as {
      annotationsPanelVisible: { set(value: boolean): void };
    };
    viewer.annotationsPanelVisible.set(true);
    hostFixture.detectChanges();

    expect(hostFixture.nativeElement.querySelector('.risk-template')?.textContent).toContain('Risk note');
    expect(hostFixture.nativeElement.querySelector('.default-template')?.textContent).toContain('Comment note');
  });
});
