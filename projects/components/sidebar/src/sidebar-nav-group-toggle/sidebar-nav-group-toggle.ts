import { ChangeDetectionStrategy, Component, computed, contentChild, inject, signal } from '@angular/core';
import { Ripple } from '@ngstarter-ui/components/core';
import { SidebarNavStore } from '../sidebar.store';
import { SidebarNavItemIconDirective } from '../sidebar-nav-item-icon.directive';

@Component({
  selector: 'ngs-sidebar-nav-group-toggle',
  exportAs: 'ngsSidebarNavGroupToggle',
  templateUrl: './sidebar-nav-group-toggle.html',
  styleUrl: './sidebar-nav-group-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    Ripple
  ],
  host: {
    'class': 'ngs-sidebar-nav-group-toggle',
    '[class.is-active]': 'active',
    '[class.has-item-icon]': 'hasItemIcon()',
    '(click)': 'toggle($event)'
  }
})
export class SidebarNavGroupToggle {
  private _navStore = inject(SidebarNavStore);

  readonly for = signal<any>(null);
  readonly itemIcon = contentChild(SidebarNavItemIconDirective);
  readonly hasItemIcon = computed(() => Boolean(this.itemIcon()));

  get active(): boolean {
    if (!this.for()) {
      return false;
    }

    return this._navStore.isGroupActive(this.for());
  }

  toggle(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this._navStore.isGroupActive(this.for())) {
      this._navStore.setGroupActiveKey(null);
    } else {
      this._navStore.setGroupActiveKey(this.for());
    }
  }
}
