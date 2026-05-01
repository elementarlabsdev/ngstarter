import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-empty-state-icon',
  exportAs: 'ngsEmptyStateIcon',
  templateUrl: './empty-state-icon.html',
  styleUrl: './empty-state-icon.scss',
  host: {
    'class': 'ngs-empty-state-icon'
  },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateIcon {}
