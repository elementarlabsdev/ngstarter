import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-tab-panel-content',
  exportAs: 'ngsTabPanelContent',
  templateUrl: './tab-panel-content.html',
  styleUrl: './tab-panel-content.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-tab-panel-content'
  }
})
export class TabPanelContent {

}
