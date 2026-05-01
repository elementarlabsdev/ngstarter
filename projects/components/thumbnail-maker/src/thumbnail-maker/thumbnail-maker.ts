import { Component, ElementRef, input, viewChild } from '@angular/core';
import { Slider, SliderThumb } from '@ngstarter-ui/components/slider';
import { FormsModule } from '@angular/forms';
import { DragImageDirective } from '../drag-image.directive';
import { Icon } from '@ngstarter-ui/components/icon';
import { ThumbnailMakerApi } from '../types';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'ngs-thumbnail-maker',
  exportAs: 'ngsThumbnailMaker',
  imports: [
    Slider,
    SliderThumb,
    FormsModule,
    DragImageDirective,
    Icon,

    Button
  ],
  templateUrl: './thumbnail-maker.html',
  styleUrl: './thumbnail-maker.scss',
  host: {
    'class': 'ngs-thumbnail-maker',
    '[class.loading]': 'loading'
  }
})
export class ThumbnailMaker {
  private _content = viewChild.required<ElementRef>('content');
  private _dragImage = viewChild.required<DragImageDirective>(DragImageDirective);
  private _thumbnailSize = 300;

  src = input.required<string>();
  helperText = input('');

  get api(): ThumbnailMakerApi {
    return {
      getDataUrl: () => this._dragImage().getDataUrl(),
      toBlob: (callback: BlobCallback) => this._dragImage().toBlob(callback),
      getCanvas: () => this._dragImage().getCanvas(),
      increase: () => this.increase(),
      decrease: () => this.decrease()
    }
  }

  protected scale = 0;
  protected min = 1;
  protected max = 100;
  protected loading = true;
  protected alreadyDragged = false;

  protected get isEqualsToMinScale(): boolean {
    return this.scale <= this.min / 100;
  }

  protected get isEqualsToMaxScale(): boolean {
    return this.scale >= this.max / 100;
  }

  protected onLoad(event: Event): void {
    const contentEl = this._content().nativeElement as HTMLElement;
    const target = event.target as HTMLImageElement;
    const heightScale =  this._thumbnailSize / target.height;
    const widthScale = this._thumbnailSize / target.width;
    const minScale = Math.max(heightScale, widthScale);
    this.scale = minScale;
    this.min = minScale * 100;
    this.loading = false;
  }

  protected onDragStart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.alreadyDragged = true;
  }

  protected onScaleChange($event: number) {
    this.scale = $event / 100;
  }

  protected increase(): void {
    if ((this.scale + .1) * 100 <= this.max) {
      this.scale += .1;
    } else {
      this.scale = this.max / 100;
    }
  }

  protected decrease(): void {
    if ((this.scale - .1) * 100 >= this.min) {
      this.scale -= .1;
    } else {
      this.scale = this.min / 100;
    }
  }
}
