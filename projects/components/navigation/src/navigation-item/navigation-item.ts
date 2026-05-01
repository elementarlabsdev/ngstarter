import {
  booleanAttribute,
  Component, ElementRef,
  inject,
  contentChild, TemplateRef, input, ChangeDetectionStrategy, computed
} from '@angular/core';
import { NavigationItemIconDirective } from '../navigation-item-icon.directive';
import { Ripple } from '@ngstarter/components/core';
import { NgTemplateOutlet } from '@angular/common';
import { NAVIGATION, NAVIGATION_GROUP } from '../types';
import { Navigation } from '../navigation/navigation';
import { NavigationStore } from '../navigation.store';
import { NavigationGroup } from '../navigation-group/navigation-group';

let nextKey = 0;

@Component({
  selector: 'ngs-navigation-item,[ngs-navigation-item]',
  exportAs: 'ngsNavigationItem',
  imports: [
    Ripple,
    NgTemplateOutlet
  ],
  templateUrl: './navigation-item.html',
  styleUrl: './navigation-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-navigation-item',
    '[class.is-active]': 'forceActive() || active()',
    '[class.is-badge-text-only]': 'badgeTextOnly()',
    '(click)': 'click($event)'
  }
})
export class NavigationItem {
  private store= inject(NavigationStore);
  private _navigation = inject<Navigation>(NAVIGATION);
  private _elementRef = inject(ElementRef);
  private parentGroup = inject<NavigationGroup>(NAVIGATION_GROUP, { optional: true });

  protected readonly iconRef = contentChild(NavigationItemIconDirective);
  readonly active = computed(() => {
    return this.store.activeKey() === this.key();
  });

  get api() {
    return {
      isActive: () => this.active()
    }
  }

  readonly key = input<any>(`ngs-navigation-item-${nextKey++}`);
  readonly forceActive = input(false, {
    transform: booleanAttribute
  });
  readonly badgeTextOnly = input(false, {
    transform: booleanAttribute
  });

  protected click(event: MouseEvent) {
    if (!this.key()) {
      return;
    }

    this._navigation.itemClicked.emit(this.key());
    this.store.setActiveKey(this.key());

    if (this.parentGroup) {
      this.store.setActiveGroupKey(this.parentGroup.key());
    } else {
      this.store.setActiveGroupKey(null);
    }
  }

  get _hostElement(): ElementRef {
    return this._elementRef;
  }

  protected get iconRefTemplate(): TemplateRef<any> {
    return this.iconRef()?.templateRef as TemplateRef<any>;
  }
}
