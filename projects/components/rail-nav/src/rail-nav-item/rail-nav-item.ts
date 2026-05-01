import { Component, inject, input } from '@angular/core';
import { v7 as uuid } from 'uuid';
import { RAIL_NAV, RailNavComponent } from '../types';
import { Ripple } from '@ngstarter-ui/components/core';

@Component({
  selector: 'ngs-rail-nav-item,[ngs-rail-nav-item]',
  exportAs: 'ngsRailNavItem',
  templateUrl: './rail-nav-item.html',
  styleUrl: './rail-nav-item.scss',
  imports: [
    Ripple
  ],
  host: {
    'class': 'ngs-rail-nav-item',
    '[class.is-active]': 'isActive',
    '(click)': 'click($event)'
  }
})
export class RailNavItem {
  protected _railNav = inject<RailNavComponent>(RAIL_NAV);

  key = input(uuid());

  get isActive(): boolean {
    if (!this.key() || !this._railNav.api.getActiveKey()) {
      return false;
    }

    return this._railNav.api.isActive(this.key());
  }

  click(event: MouseEvent) {
    if (!this.key()) {
      return;
    }

    this._railNav.api.activateItem(this.key());
  }
}
