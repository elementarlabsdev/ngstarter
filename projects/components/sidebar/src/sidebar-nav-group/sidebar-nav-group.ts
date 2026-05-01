import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  forwardRef,
} from '@angular/core';
import { SidebarNavGroupToggle } from '../sidebar-nav-group-toggle/sidebar-nav-group-toggle';
import { SIDEBAR_NAVIGATION_GROUP } from '../types';
import { SidebarNavGroupMenu } from '../sidebar-nav-group-menu/sidebar-nav-group-menu';

let nextId = 0;

@Component({
  selector: 'ngs-sidebar-nav-group',
  templateUrl: './sidebar-nav-group.html',
  styleUrl: './sidebar-nav-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: SIDEBAR_NAVIGATION_GROUP,
      useExisting: forwardRef(() => SidebarNavGroup),
    }
  ]
})
export class SidebarNavGroup implements AfterContentInit {
  private _toggle = contentChild.required(SidebarNavGroupToggle, {
    descendants: false,
  });
  private _menu = contentChild.required(SidebarNavGroupMenu, {
    descendants: false,
  });
  readonly _groupId = `sidebar-nav-group-${nextId++}`;

  ngAfterContentInit() {
    this._toggle().for.set(this._groupId);
  }

  hasActiveItem(): boolean {
    return this._menu().hasActiveItem();
  }
}
