import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  inject,
  contentChildren,
  computed,
  ChangeDetectionStrategy,
  effect,
  input,
  TemplateRef
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationItem } from '../navigation-item/navigation-item';
import { NAVIGATION_GROUP } from '../types';
import { NavigationGroup } from '../navigation-group/navigation-group';
import { NavigationStore } from '../navigation.store';
import { NavigationItemDefDirective } from '../navigation-item-def.directive';

@Component({
  selector: 'ngs-navigation-group-menu',
  exportAs: 'ngsNavigationGroupMenu',
  templateUrl: './navigation-group-menu.html',
  styleUrl: './navigation-group-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet
  ],
  standalone: true,
  host: {
    'class': 'ngs-navigation-group-menu',
    '[class.is-active]': 'active()'
  }
})
export class NavigationGroupMenu implements AfterContentInit {
  private store= inject(NavigationStore);
  private _group = inject<NavigationGroup>(NAVIGATION_GROUP);

  readonly active = computed(() => {
    return this.store.activeGroupKey() === this._group.key();
  });
  readonly _items = contentChildren(
    NavigationItem, { descendants: true }
  );
  readonly _defs = contentChildren(NavigationItemDefDirective);

  dataSource = input<any[]>();
  itemTypeProperty = input<string>('type');

  readonly hasActiveItemInGroup = computed(() => {
    const fromItems = this._items().some(item => this.store.activeKey() === item.key());

    if (fromItems) {
      return true;
    }

    const data = this.dataSource();

    if (data) {
      return data.some(item => this._isActive(item, this.store.activeKey()));
    }

    return false;
  });

  ngAfterContentInit() {
    this._detectGroupIsActive();
  }

  getTemplate(item: any): TemplateRef<any> | null {
    const def = this._defs().find(d => {
      const whenValue = d.when();
      if (whenValue) {
        if (typeof whenValue === 'function') {
          return (whenValue as Function)(item);
        }
        return item[this.itemTypeProperty()] === whenValue;
      }

      return false;
    }) || this._defs().find(d => !d.when());

    return def?.template || null;
  }

  private _detectGroupIsActive() {
    if (this.hasActiveItemInGroup() && !this.active()) {
      this.store.setActiveGroupKey(this._group.key());
    } else {
      if (this.store.activeGroupKey() === this._group.key()) {
        this.store.setActiveGroupKey(null);
      } else {
        this.store.setActiveGroupKey(this._group.key());
      }
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
