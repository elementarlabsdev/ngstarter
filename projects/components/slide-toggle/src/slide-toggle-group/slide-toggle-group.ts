import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-slide-toggle-group',
  exportAs: 'ngsSlideToggleGroup',
  standalone: true,
  imports: [],
  templateUrl: './slide-toggle-group.html',
  styleUrl: './slide-toggle-group.scss',
  host: {
    'class': 'ngs-slide-toggle-group'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideToggleGroup {}
