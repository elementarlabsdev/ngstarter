import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  inject,
  input,
  OnInit,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SIDEBAR_NAVIGATION, SIDEBAR_NAVIGATION_GROUP } from '../types';
import { SidebarNav } from '../sidebar-nav/sidebar-nav';
import { SidebarNavGroup } from '../sidebar-nav-group/sidebar-nav-group';
import { SidebarNavItem } from '../sidebar-nav-item/sidebar-nav-item';
import { SidebarNavStore } from '../sidebar.store';
import { SidebarNavItemDefDirective } from '../sidebar-nav/sidebar-nav-item-def.directive';

@Component({
  selector: 'ngs-sidebar-nav-group-menu',
  exportAs: 'ngsSidebarNavGroupMenu',
  templateUrl: './sidebar-nav-group-menu.html',
  styleUrl: './sidebar-nav-group-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgTemplateOutlet
  ],
  host: {
    'class': 'ngs-sidebar-nav-group-menu',
    '[class.is-active]': 'active'
  }
})
export class SidebarNavGroupMenu implements AfterContentInit, OnInit {
  readonly navigation = inject<SidebarNav>(SIDEBAR_NAVIGATION);
  private _group = inject<SidebarNavGroup>(SIDEBAR_NAVIGATION_GROUP);
  private _navStore = inject(SidebarNavStore);

  readonly _items = contentChildren(SidebarNavItem, { descendants: true });
  readonly _defs = contentChildren(SidebarNavItemDefDirective);

  key = signal<any>(this._group._groupId);
  dataSource = input<any[]>();
  itemTypeProperty = input<string>('type');

  get active(): boolean {
    return this._navStore.isGroupActive(this.key());
  }

  ngOnInit() {
    this.navigation
      .itemClicked
      .subscribe(() => {
        if (!this.hasActiveItem() && this._group._groupId === this._navStore.activeGroupKey()) {
          this._navStore.setGroupActiveKey(null);
        }
      });
  }

  ngAfterContentInit() {
    this._checkIfActive();
  }

  hasActiveItem(): boolean {
    const fromItems = this._items().some(item => item.active);
    if (fromItems) {
      return true;
    }

    const data = this.dataSource();
    if (data) {
      const activeKey = this._navStore.activeItemKey();
      return data.some(item => this._isActive(item, activeKey));
    }

    return false;
  }

  getTemplate(item: any): TemplateRef<any> | null {
    const def = this._defs().find(d => {
      const whenValue = d.when();
      if (whenValue) {
        if (typeof whenValue === 'function') {
          return whenValue(item);
        }
        return item[this.itemTypeProperty()] === whenValue;
      }

      return false;
    }) || this._defs().find(d => !d.when());

    return def?.template || null;
  }

  private _checkIfActive() {
    if (this.hasActiveItem()) {
      this._navStore.setGroupActiveKey(this.key());
    }
  }

  private _isActive(item: any, activeKey: any): boolean {
    if (item.key === activeKey) {
      return true;
    }

    if (item.children && Array.isArray(item.children)) {
      return item.children.some((child: any) => this._isActive(child, activeKey));
    }

    return false;
  }
}
