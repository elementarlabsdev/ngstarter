import { Component, computed, inject } from '@angular/core';
import { LAYOUT } from '../types';
import { Layout } from '../layout/layout';
import { LayoutSidebarStore } from '../layout.store';

@Component({
  selector: 'ngs-layout-sidebar',
  exportAs: 'ngsLayoutSidebar',
  templateUrl: './layout-sidebar.html',
  styleUrl: './layout-sidebar.scss',
  host: {
    'class': 'ngs-layout-sidebar',
    '[class.is-hidden]': '!_isShown()'
  }
})
export class LayoutSidebar {
  private _parent = inject<Layout>(LAYOUT);
  private _layoutSidebarStore = inject<any>(LayoutSidebarStore);

  protected _isShown = computed<boolean>(() => {
    if (this._parent.layoutId() in this._layoutSidebarStore) {
      return this._layoutSidebarStore[this._parent.layoutId()]();
    }

    return true;
  });
}
