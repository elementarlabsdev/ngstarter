import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-image-placeholder',
  exportAs: 'ngsImagePlaceholder',
  imports: [],
  templateUrl: './image-placeholder.html',
  styleUrl: './image-placeholder.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-image-placeholder'
  }
})
export class ImagePlaceholder {

}
