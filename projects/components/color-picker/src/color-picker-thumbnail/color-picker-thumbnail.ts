import { Component, ElementRef, inject, input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ngs-color-picker-thumbnail,[ngs-color-picker-thumbnail]',
  exportAs: 'ngsColorPickerThumbnail',
  templateUrl: './color-picker-thumbnail.html',
  styleUrl: './color-picker-thumbnail.scss',
  host: {
    'class': 'ngs-color-picker-thumbnail'
  }
})
export class ColorPickerThumbnail {
  private _elementRef = inject(ElementRef);

  color = input('');

  ngOnChanges(changes: SimpleChanges) {
    if (!this.color()) {
      return;
    }

    this._elementRef.nativeElement.style.setProperty('--ngs-color-picker-thumbnail-bg', this.color());
  }
}
