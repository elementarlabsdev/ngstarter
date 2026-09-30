import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-skeleton-rectangle',
  exportAs: 'ngsSkeletonRectangle',
  template: '',
  styleUrl: './skeleton-rectangle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-skeleton ngs-skeleton-rectangle'
  }
})
export class SkeletonRectangle {}
