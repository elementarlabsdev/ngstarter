import {
  afterRenderEffect,
  ElementRef,
  inject,
  Renderer2,
  viewChild,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';
import { BaseComponent } from '../base';
import { TinyColor } from '@ctrl/tinycolor';

@Component({
  selector: 'ngs-alpha',
  exportAs: 'ngsAlpha',
  templateUrl: './alpha.html',
  styleUrl: './alpha.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'ngs-alpha' }
})
export class Alpha extends BaseComponent {
  private readonly pointer = viewChild.required<ElementRef<HTMLElement>>('pointer');
  private readonly pointerBg = viewChild.required<ElementRef<HTMLElement>>('pointerBg');
  private readonly gradientElement = viewChild.required<ElementRef<HTMLElement>>('gradient');

  constructor() {
    super();
    const renderer = inject(Renderer2);
    afterRenderEffect(() => {
      renderer.setStyle(this.pointer().nativeElement, 'left', `${this.alpha() * 100}%`);
      renderer.setStyle(this.pointerBg().nativeElement, 'background-color', this.pointerColor());
      renderer.setStyle(this.gradientElement().nativeElement, 'background', this.gradient());
    });
  }

  tinyColor = input.required<TinyColor>();
  colorFromHue = input<TinyColor | undefined | null>();
  readonly alphaChange = output<number>();
  protected readonly alpha = computed(() => this.tinyColor().getAlpha());
  protected readonly pointerColor = computed(() => this.tinyColor().toRgbString());
  protected readonly gradient = computed(() => {
    const { r, g, b } = this.tinyColor().toRgb();
    return `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0) 0%, rgb(${r}, ${g}, ${b}) 100%)`;
  });

  movePointer({ x, width }: { x: number; y: number; height: number; width: number }): void {
    if (width > 0) {
      this.alphaChange.emit(Math.max(0, Math.min(x / width, 1)));
    }
  }
}
