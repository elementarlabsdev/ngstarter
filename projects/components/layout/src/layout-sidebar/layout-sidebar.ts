import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { LAYOUT } from '../types';
import { Layout } from '../layout/layout';
import { LayoutSidebarStore } from '../layout.store';

@Component({
  selector: 'ngs-layout-sidebar',
  exportAs: 'ngsLayoutSidebar',
  templateUrl: './layout-sidebar.html',
  styleUrl: './layout-sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-layout-sidebar',
    '[class.is-hidden]': '!_isShown()'
  }
})
export class LayoutSidebar {
  private _parent = inject<Layout>(LAYOUT);
  private _layoutSidebarStore = inject(LayoutSidebarStore);

  protected _isShown = computed(() =>
    this._layoutSidebarStore.isSidebarShown(this._parent.layoutId())
  );
}
