import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-empty-state-content',
  exportAs: 'ngsEmptyStateContent',
  templateUrl: './empty-state-content.html',
  styleUrl: './empty-state-content.scss',
  host: {
    'class': 'ngs-empty-state-content'
  },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateContent {}
