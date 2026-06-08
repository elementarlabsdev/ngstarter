import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfViewer } from './pdf-viewer';

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

  it('should resize page shells immediately on zoom and drop stale images', () => {
    const component = fixture.componentInstance as unknown as {
      pdfDocument: unknown;
      renderedPages: {
        set(value: unknown[]): void;
        (): Array<{ scale: number; url: string | null; width: number; height: number; textGlyphs: unknown[] }>;
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
    expect(component.renderedPages()[0].url).toBeNull();
    expect(component.renderedPages()[0].width).toBe(200);
    expect(component.renderedPages()[0].height).toBe(400);
    expect(component.renderedPages()[0].textGlyphs).toEqual([]);
  });
});
