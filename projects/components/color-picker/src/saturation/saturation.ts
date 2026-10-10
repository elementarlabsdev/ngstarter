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
  model,
  output
} from '@angular/core';
import { BaseComponent } from '../base';
import { TinyColor } from '@ctrl/tinycolor';

@Component({
  selector: 'ngs-saturation',
  exportAs: 'ngsSaturation',
  templateUrl: './saturation.html',
  styleUrl: './saturation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-saturation'
  }
})
export class Saturation extends BaseComponent {
  private readonly pointer = viewChild.required<ElementRef<HTMLElement>>('pointer');

  constructor() {
    super();
    const renderer = inject(Renderer2);
    afterRenderEffect(() => {
      renderer.setStyle(this.elementRef.nativeElement, 'background-color', this.backgroundColor());
      renderer.setStyle(this.pointer().nativeElement, 'top', `${(1 - this.hsv().v) * 100}%`);
      renderer.setStyle(this.pointer().nativeElement, 'left', `${this.hsv().s * 100}%`);
      renderer.setStyle(this.pointer().nativeElement, 'background-color', this.pointerColor());
    });
  }

  tinyColor = model.required<TinyColor>();
  colorFromHue = input<TinyColor | undefined | null>();
  readonly colorChange = output<TinyColor>();

  protected readonly hsv = computed(() => this.tinyColor().toHsv());
  protected readonly hue = computed(() => (this.colorFromHue() ?? this.tinyColor()).toHsv().h);
  protected readonly backgroundColor = computed(() =>
    new TinyColor({ h: this.hue(), s: 1, v: 1 }).toRgbString());
  protected readonly pointerColor = computed(() => this.tinyColor().clone().setAlpha(1).toRgbString());

  movePointer({ x, y, height, width }: { x: number; y: number; height: number; width: number }): void {
    if (width <= 0 || height <= 0) {
      return;
    }
    this.colorChange.emit(new TinyColor({
      h: this.hue(),
      s: Math.max(0, Math.min(x / width, 1)),
      v: 1 - Math.max(0, Math.min(y / height, 1))
    }));
  }
}
