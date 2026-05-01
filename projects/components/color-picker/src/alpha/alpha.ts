import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject, input,
  OnChanges, OnInit, output,
  Renderer2, SimpleChanges,
  viewChild
} from '@angular/core';
import { BaseComponent } from '../base';
import { NgStyle } from '@angular/common';
import { TinyColor } from '@ctrl/tinycolor';

@Component({
  selector: 'ngs-alpha',
  exportAs: 'ngsAlpha',
  imports: [
    NgStyle
  ],
  templateUrl: './alpha.html',
  styleUrl: './alpha.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-alpha'
  }
})
export class Alpha extends BaseComponent implements OnChanges, OnInit {
  private _renderer = inject(Renderer2);
  private _pointer = viewChild.required<ElementRef>('pointer');
  private _pointerBg = viewChild.required<ElementRef>('pointerBg');

  tinyColor = input.required<TinyColor>();
  colorFromHue = input<TinyColor | undefined | null>();

  private tmpColor!: TinyColor;
  private alpha = 1;

  readonly alphaChange = output<any>();

  ngOnInit() {
    this.tmpColor = this.tinyColor();
    this.alpha = this.tmpColor.getAlpha();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tinyColor'] && changes['tinyColor'].previousValue !== changes['tinyColor'].currentValue) {
      if (!changes['tinyColor'].currentValue) {
        return;
      }

      this.tmpColor = changes['tinyColor'].currentValue.clone();
      this.alpha = this.tmpColor.getAlpha();
      this.changePointerPosition(this.tmpColor.getAlpha());
      this._setPointerBgColor(this.tmpColor);
    }

    if (changes['colorFromHue'] && changes['colorFromHue'].previousValue !== changes['colorFromHue'].currentValue) {
      if (!changes['colorFromHue'].currentValue) {
        return;
      }

      this.tmpColor = changes['colorFromHue'].currentValue.clone().setAlpha(this.alpha);
      this._setPointerBgColor(this.tmpColor);
    }
  }

  // @ts-ignore
  movePointer({ x, y, height, width }): void {
    const alpha = x / width;
    this.changePointerPosition(alpha);
    const newColor = this.tmpColor.clone().setAlpha(alpha);
    this._renderer.setStyle(this._pointerBg().nativeElement, 'background-color', newColor.toRgbString());
    this.alphaChange.emit(alpha);
  }

  get gradient(): string {
    const rgba = this.tmpColor.toRgb();
    const orientation = 'right';
    return `linear-gradient(to ${orientation}, rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0) 0%, rgb(${rgba.r}, ${rgba.g}, ${rgba.b}) 100%)`;
  }

  /**
   * hue value is in range from 0 to 360°
   */
  private changePointerPosition(alpha: number): void {
    const x = alpha * 100;
    const orientation = 'left';
    this._renderer.setStyle(this._pointer().nativeElement, orientation, `${x}%`);
    this.alpha = alpha;
  }

  private _setPointerBgColor(tinyColor: TinyColor) {
    this._renderer.setStyle(
      this._pointerBg().nativeElement, 'background-color', tinyColor.clone().setAlpha(this.alpha).toRgbString()
    );
  }
}
