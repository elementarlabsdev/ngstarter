import { Component } from '@angular/core';
import { TAB_PANEL_ASIDE } from '../types';

@Component({
  selector: 'ngs-tab-panel-aside',
  exportAs: 'ngsTabPanelAside',
  templateUrl: './tab-panel-aside.html',
  styleUrl: './tab-panel-aside.scss',
  providers: [
    {
      provide: TAB_PANEL_ASIDE,
      useExisting: TabPanelAside
    }
  ],
  host: {
    'class': 'ngs-tab-panel-aside'
  }
})
export class TabPanelAside {
  nextId = 0;
}
