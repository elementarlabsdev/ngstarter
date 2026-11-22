import { PlatformLocation } from '@angular/common';
import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';

import { ScrollSpyNav } from '../scroll-spy-nav/scroll-spy-nav';
import { SCROLL_SPY_NAV } from '../types';

@Component({
  selector: 'ngs-scroll-spy-on,[ngs-scroll-spy-on]',
  exportAs: 'ngsScrollSpyOn',
  templateUrl: './scroll-spy-on.html',
  styleUrl: './scroll-spy-on.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-scroll-spy-on',
    '[attr.href]': 'href',
    '[class.is-active]': 'isActive',
    '(click)': '_handleClick($event)'
  }
})
export class ScrollSpyOn {
  private _parent = inject<ScrollSpyNav>(SCROLL_SPY_NAV);
  private _location = inject(PlatformLocation);

  targetId = input.required<string>();

  protected get href(): string {
    const { pathname, search } = this._location;
    return `${pathname}${search}#${encodeURIComponent(this.targetId())}`;
  }

  protected get isActive() {
    return this.targetId() === this._parent.activeId;
  }

  protected _handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this._parent.scrollTo(this.targetId());
  }
}
