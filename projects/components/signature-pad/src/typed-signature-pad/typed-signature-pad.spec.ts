import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { TypedSignaturePad, type TypedSignaturePadValue } from './typed-signature-pad';

describe('TypedSignaturePad', () => {
  let fixture: ComponentFixture<TypedSignaturePad>;
  let component: TypedSignaturePad;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypedSignaturePad],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TypedSignaturePad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a font chooser, color switcher, and typing surface', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.typed-signature-font-trigger')?.textContent).toContain('Signature');
    expect(element.querySelector('ngs-color-switcher.ngs-brand-colors')).not.toBeNull();
    expect(element.querySelectorAll('ngs-color-switcher .color').length).toBe(3);
    expect(element.querySelector<HTMLInputElement>('.typed-signature-input')).not.toBeNull();
    expect(element.querySelector('.line')).not.toBeNull();
  });

  it('emits typed signature metadata with an image data URL', () => {
    const emitted: TypedSignaturePadValue[] = [];
    const subscription = component.signatureTyped.subscribe(value => emitted.push(value));
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLInputElement>('.typed-signature-input');

    expect(input).not.toBeNull();

    input!.value = 'P.S.';
    input!.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toEqual(expect.objectContaining({
      value: 'P.S.',
      color: '#000',
    }));
    expect(emitted[0].dataUrl).toMatch(/^data:image\/svg\+xml/);

    subscription.unsubscribe();
  });
});
