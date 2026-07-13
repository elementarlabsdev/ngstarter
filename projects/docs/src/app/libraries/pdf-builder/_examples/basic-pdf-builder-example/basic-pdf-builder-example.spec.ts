import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { BasicPdfBuilderExample } from './basic-pdf-builder-example';

class ResizeObserverMock {
  observe(): void {}

  unobserve(): void {}

  disconnect(): void {}
}

describe('BasicPdfBuilderExample', () => {
  let component: BasicPdfBuilderExample;
  let fixture: ComponentFixture<BasicPdfBuilderExample>;

  beforeEach(async () => {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: ResizeObserverMock,
    });

    await TestBed.configureTestingModule({
      imports: [BasicPdfBuilderExample],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicPdfBuilderExample);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('passes test recipients to the PDF builder', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('ngs-pdf-builder')).not.toBeNull();
    expect(element.textContent).toContain('Add recipients');
    expect(element.textContent).toContain('Pavel Salauyou');
    expect(element.textContent).toContain('Signer');
    expect(element.textContent).toContain('YOU');
    expect(element.textContent).toContain('pavel.salauyou@gmail.com');
    expect(element.textContent).toContain('Add recipient');
  });

  it('removes recipients from the example when the builder emits removeRecipient', () => {
    const element: HTMLElement = fixture.nativeElement;

    element.querySelector<HTMLButtonElement>('button[aria-label="Recipient actions"]')!.click();
    fixture.detectChanges();

    const removeButton = Array.from(document.querySelectorAll<HTMLButtonElement>('.ngs-menu-panel [ngs-menu-item]'))
      .find(button => button.textContent?.includes('Remove'));

    removeButton!.click();
    fixture.detectChanges();

    expect(element.textContent).not.toContain('Pavel Salauyou');
    expect(element.textContent).toContain('Legal Approver');
  });
});
