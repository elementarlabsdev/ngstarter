import {
  AfterContentInit,
  afterNextRender, booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  ElementRef, forwardRef,
  inject,
  input,
  output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  SidebarNavItem
} from '../sidebar-nav-item/sidebar-nav-item';
import { SIDEBAR_NAVIGATION } from '../types';
import { SidebarNavStore } from '../sidebar.store';
import { SidebarNavGroup } from '../sidebar-nav-group/sidebar-nav-group';
import { SidebarNavItemDefDirective } from './sidebar-nav-item-def.directive';

@Component({
  selector: 'ngs-sidebar-nav',
  exportAs: 'ngsSidebarNav',
  templateUrl: './sidebar-nav.html',
  styleUrl: './sidebar-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgTemplateOutlet
  ],
  providers: [
    {
      provide: SIDEBAR_NAVIGATION,
      useExisting: forwardRef(() => SidebarNav),
    },
    SidebarNavStore
  ],
  host: {
    'class': 'ngs-sidebar-nav',
  },
})
export class SidebarNav implements AfterContentInit {
  private _elementRef = inject(ElementRef);
  private _navStore = inject(SidebarNavStore);

  readonly _items = contentChildren(SidebarNavItem, { descendants: true });
  readonly _groups = contentChildren(SidebarNavGroup, { descendants: true });
  readonly _defs = contentChildren(SidebarNavItemDefDirective);

  activeKey = input();
  dataSource = input<any[]>();
  itemTypeProperty = input<string>('type');
  autoScrollToActiveItem = input(false, {
    transform: booleanAttribute
  });

  readonly itemClicked = output<any>();

  constructor() {
    // scroll to the active item if it is not visible in the viewport
    afterNextRender(() => {
      if (this.autoScrollToActiveItem()) {
        this._scrollToActiveItem();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeKey']) {
      this._navStore.setItemActiveKey(changes['activeKey'].currentValue);
      this._groups().forEach((group: SidebarNavGroup) => {
        if (group.hasActiveItem()) {
          this._navStore.setGroupActiveKey(group._groupId);
          requestAnimationFrame(() => {
            this._scrollToActiveItem();
          });
        }
      });
    }
  }

  ngAfterContentInit() {
  }

  private _hasScroll(element: HTMLElement): boolean {
    if (!element.getBoundingClientRect) {
      return false;
    }

    return Math.ceil(element.scrollHeight) > Math.ceil(element.getBoundingClientRect().height);
  }

  private _isScrolledIntoView(element: HTMLElement, parent: HTMLElement) {
    const elementRect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    return (elementRect.top >= 0) && (elementRect.bottom <= parentRect.height);
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

  private _scrollToActiveItem(): void {
    this._items().forEach((item: SidebarNavItem) => {
      if (item.active) {
        let scrollContainer = this._elementRef.nativeElement.closest('.scrollable-content');
        const itemElement = item._hostElement.nativeElement as HTMLElement;

        if (this._hasScroll(scrollContainer)) {
          if (!this._isScrolledIntoView(itemElement, scrollContainer)) {
            const parentRect = scrollContainer.getBoundingClientRect();
            const elementRect = itemElement.getBoundingClientRect();
            scrollContainer.scrollTop = elementRect.top - parentRect.height / 2;
          }
        }
      }
    });
  }
}
