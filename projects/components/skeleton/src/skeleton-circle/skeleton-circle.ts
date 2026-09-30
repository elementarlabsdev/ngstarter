import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-skeleton-circle',
  exportAs: 'ngsSkeletonCircle',
  template: '',
  styleUrl: './skeleton-circle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ngs-skeleton ngs-skeleton-circle'
  }
})
export class SkeletonCircle {}
