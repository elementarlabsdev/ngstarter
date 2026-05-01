import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsTabPanelItemIcon]',
  exportAs: 'ngsTabPanelItemIcon',
  host: {
    'class': 'ngs-tab-panel-item-icon'
  }
})
export class TabPanelItemIconDirective {
}
