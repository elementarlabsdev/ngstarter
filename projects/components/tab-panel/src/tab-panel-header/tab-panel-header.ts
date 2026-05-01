import { Component } from '@angular/core';

@Component({
  selector: 'ngs-tab-panel-header',
  exportAs: 'ngsTabPanelHeader',
  templateUrl: './tab-panel-header.html',
  styleUrl: './tab-panel-header.scss',
  host: {
    'class': 'ngs-tab-panel-header'
  }
})
export class TabPanelHeader {
}
