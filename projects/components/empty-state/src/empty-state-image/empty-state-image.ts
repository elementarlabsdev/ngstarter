import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-empty-state-image',
  exportAs: 'ngsEmptyStateImage',
  templateUrl: './empty-state-image.html',
  styleUrl: './empty-state-image.scss',
  host: {
    'class': 'ngs-empty-state-image'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateImage {}
