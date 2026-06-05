import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-empty-state-actions',
  exportAs: 'ngsEmptyStateActions',
  templateUrl: './empty-state-actions.html',
  styleUrl: './empty-state-actions.scss',
  host: {
    'class': 'ngs-empty-state-actions'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateActions {}
