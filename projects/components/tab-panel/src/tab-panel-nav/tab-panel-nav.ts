import { Component } from '@angular/core';
import { TAB_PANEL_NAV } from '../types';

@Component({
  selector: 'ngs-tab-panel-nav',
  exportAs: 'ngsTabPanelNav',
  templateUrl: './tab-panel-nav.html',
  styleUrl: './tab-panel-nav.scss',
  providers: [
    {
      provide: TAB_PANEL_NAV,
      useExisting: TabPanelNav
    }
  ],
  host: {
    'class': 'ngs-tab-panel-nav'
  }
})
export class TabPanelNav {
  nextId = 0;
}
