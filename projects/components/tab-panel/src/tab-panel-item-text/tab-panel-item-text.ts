import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-tab-panel-item-text',
  exportAs: 'ngsTabPanelItemText',
  templateUrl: './tab-panel-item-text.html',
  styleUrl: './tab-panel-item-text.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-tab-panel-item-text'
  }
})
export class TabPanelItemText {
}
