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
  selector: 'ngs-hue',
  exportAs: 'ngsHue',
  templateUrl: './hue.html',
  styleUrl: './hue.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'ngs-hue' }
})
export class Hue extends BaseComponent {
  private readonly pointer = viewChild.required<ElementRef<HTMLElement>>('pointer');

  constructor() {
    super();
    const renderer = inject(Renderer2);
    afterRenderEffect(() => {
      renderer.setStyle(this.pointer().nativeElement, 'left', `${this.hue() / 360 * 100}%`);
      renderer.setStyle(this.pointer().nativeElement, 'background-color', this.pointerColor());
    });
  }

  tinyColor = input.required<TinyColor>();
  readonly colorChange = output<TinyColor>();
  protected readonly hue = computed(() => this.tinyColor().toHsv().h);
  protected readonly pointerColor = computed(() =>
    new TinyColor({ h: this.hue(), s: 1, v: 1 }).toRgbString());

  movePointer({ x, width }: { x: number; y: number; height: number; width: number }): void {
    if (width <= 0) {
      return;
    }
    const h = Math.max(0, Math.min((x / width) * 360, 359));
    this.colorChange.emit(new TinyColor({ h, s: 1, v: 1 }));
  }
}
