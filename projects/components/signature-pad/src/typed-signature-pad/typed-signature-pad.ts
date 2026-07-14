import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  RendererStyleFlags2,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { ColorSwitcher } from '@ngstarter-ui/components/color-switcher';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  Menu,
  MenuItem,
  MenuTrigger,
} from '@ngstarter-ui/components/menu';

export interface TypedSignatureFont {
  readonly label: string;
  readonly family: string;
}

export interface TypedSignaturePadValue {
  readonly value: string;
  readonly fontFamily: string;
  readonly color: string;
  readonly dataUrl: string;
}

const TYPED_SIGNATURE_DEFAULT_FONTS: readonly TypedSignatureFont[] = [
  {
    label: 'Signature',
    family: 'Brush Script MT, Segoe Script, cursive',
  },
  {
    label: 'Handwritten',
    family: 'Snell Roundhand, Apple Chancery, cursive',
  },
  {
    label: 'Script',
    family: 'Segoe Script, Lucida Handwriting, cursive',
  },
  {
    label: 'Classic',
    family: 'Georgia, serif',
  },
];

@Component({
  selector: 'ngs-typed-signature-pad',
  exportAs: 'ngsTypedSignaturePad',
  standalone: true,
  imports: [
    Button,
    ColorSwitcher,
    Icon,
    Menu,
    MenuItem,
    MenuTrigger,
  ],
  templateUrl: './typed-signature-pad.html',
  styleUrl: './typed-signature-pad.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-typed-signature-pad',
    '(document:keydown.escape)': 'handleEscapeKey($event)',
  },
})
export class TypedSignaturePad {
  private readonly document = inject(DOCUMENT);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('signatureInput');

  readonly value = model('');
  readonly fontFamily = model('Brush Script MT, Segoe Script, cursive');
  readonly penColor = model('#000');
  readonly placeholder = input('Type signature');
  readonly colors = input<string[]>(['#000', '#0059ff', '#ff0000']);
  readonly fonts = input<readonly TypedSignatureFont[]>(TYPED_SIGNATURE_DEFAULT_FONTS);

  readonly signatureSaved = output<string>();
  readonly signatureTyped = output<TypedSignaturePadValue>();
  readonly signatureCleared = output<void>();

  protected readonly selectedFont = computed(() =>
    this.fonts().find(font => font.family === this.fontFamily()) ??
    this.fonts()[0] ??
    TYPED_SIGNATURE_DEFAULT_FONTS[0],
  );
  protected readonly hasValue = computed(() => this.value().trim().length > 0);
  private readonly lastEmittedDataUrl = signal('');

  constructor() {
    effect(() => {
      this.setCssVar('--ngs-typed-signature-font', this.fontFamily());
      this.setCssVar('--ngs-typed-signature-color', this.penColor());
    });

    effect(() => {
      const typedValue = this.value().trim();
      this.fontFamily();
      this.penColor();

      if (!typedValue) {
        this.lastEmittedDataUrl.set('');
        return;
      }

      this.emitSignature();
    });
  }

  protected updateValue(value: string): void {
    this.value.set(value);
  }

  protected selectFont(font: TypedSignatureFont): void {
    this.fontFamily.set(font.family);
    this.focusInput();
  }

  onColorChange(color: string): void {
    this.penColor.set(color);
    this.focusInput();
  }

  clear(): void {
    this.value.set('');
    this.lastEmittedDataUrl.set('');
    this.signatureCleared.emit();
    this.focusInput();
  }

  save(): void {
    if (!this.value().trim()) {
      return;
    }

    this.emitSignature(true);
  }

  handleEscapeKey(event: Event): void {
    event.preventDefault();
    this.clear();
  }

  private emitSignature(force = false): void {
    const dataUrl = this.createSignatureDataUrl();

    if (!force && dataUrl === this.lastEmittedDataUrl()) {
      return;
    }

    const signature: TypedSignaturePadValue = {
      value: this.value().trim(),
      fontFamily: this.fontFamily(),
      color: this.penColor(),
      dataUrl,
    };

    this.lastEmittedDataUrl.set(dataUrl);
    this.signatureSaved.emit(dataUrl);
    this.signatureTyped.emit(signature);
  }

  private createSignatureDataUrl(): string {
    const value = this.escapeXml(this.value().trim());
    const fontFamily = this.escapeXml(this.fontFamily());
    const color = this.escapeXml(this.penColor());
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300">',
      '<rect width="900" height="300" fill="transparent"/>',
      `<text x="450" y="160" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-family="${fontFamily}" font-size="96" font-weight="500">${value}</text>`,
      '</svg>',
    ].join('');

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private setCssVar(name: string, value: string): void {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      name,
      value,
      RendererStyleFlags2.DashCase,
    );
  }

  private focusInput(): void {
    this.document.defaultView?.setTimeout(() => this.inputRef()?.nativeElement.focus(), 0);
  }
}
