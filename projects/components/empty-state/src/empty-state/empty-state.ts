import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-empty-state',
  exportAs: 'ngsEmptyState',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  host: {
    'class': 'ngs-empty-state',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {}
