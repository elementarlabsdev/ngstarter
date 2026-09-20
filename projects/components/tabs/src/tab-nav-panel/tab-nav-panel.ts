import { Component, ChangeDetectionStrategy } from '@angular/core';

let nextUniqueId = 0;

@Component({
  selector: 'ngs-tab-nav-panel',
  exportAs: 'ngsTabNavPanel',
  standalone: true,
  host: {
    'class': 'ngs-tab-nav-panel',
    'role': 'tabpanel',
    '[attr.id]': 'id'
  },
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '<ng-content/>'
})
export class TabNavPanel {
  id = `ngs-tab-nav-panel-${nextUniqueId++}`;
}
