import {
  Component,
  inject,
  contentChild,
  TemplateRef,
  computed,
  ChangeDetectionStrategy,
  input,
  booleanAttribute
} from '@angular/core';
import { NavigationGroupToggleIconDirective } from '../navigation-group-toggle-icon.directive';
import { Ripple } from '@ngstarter-ui/components/core';
import { NgTemplateOutlet } from '@angular/common';
import { NAVIGATION_GROUP } from '../types';
import { NavigationGroup } from '../navigation-group/navigation-group';
import { NavigationStore } from '../navigation.store';

@Component({
  selector: 'ngs-navigation-group-toggle',
  exportAs: 'ngsNavigationGroupToggle',
  imports: [
    NgTemplateOutlet
  ],
  templateUrl: './navigation-group-toggle.html',
  styleUrl: './navigation-group-toggle.scss',
  hostDirectives: [
    Ripple
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-navigation-group-toggle',
    '[class.is-active]': 'active()',
    '[class.is-badge-text-only]': 'badgeTextOnly()',
    '(click)': 'toggle($event)'
  }
})
export class NavigationGroupToggle {
  private store= inject(NavigationStore);
  private _group = inject<NavigationGroup>(NAVIGATION_GROUP);

  readonly iconRef = contentChild(NavigationGroupToggleIconDirective);
  readonly active = computed(() => {
    return this.store.activeGroupKey() === this._group.key();
  });
  readonly badgeTextOnly = input(false, {
    transform: booleanAttribute
  });

  protected toggle(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.active()) {
      this.store.setActiveGroupKey(null);
    } else {
      this.store.setActiveGroupKey(this._group.key());
    }
  }

  protected get iconRefTemplate(): TemplateRef<any> {
    return this.iconRef()?.templateRef as TemplateRef<any>;
  }
}
