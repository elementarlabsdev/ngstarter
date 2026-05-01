import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-empty-state-title,[ngs-empty-state-title]',
  exportAs: 'ngsEmptyStateTitle',
  templateUrl: './empty-state-title.html',
  styleUrl: './empty-state-title.scss',
  host: {
    'class': 'ngs-empty-state-title'
  },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateTitle {}
