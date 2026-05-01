import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-expansion-panel-title',
  exportAs: 'ngsExpansionPanelTitle',
  templateUrl: './expansion-panel-title.html',
  styleUrl: './expansion-panel-title.scss',
  host: {
    'class': 'ngs-expansion-panel-title'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPanelTitle { }
