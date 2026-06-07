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
});
