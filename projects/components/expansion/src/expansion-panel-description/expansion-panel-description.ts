import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngs-expansion-panel-description',
  exportAs: 'ngsExpansionPanelDescription',
  templateUrl: './expansion-panel-description.html',
  styleUrl: './expansion-panel-description.scss',
  host: {
    'class': 'ngs-expansion-panel-description'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPanelDescription { }
