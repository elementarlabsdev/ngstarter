import { booleanAttribute, Component, ElementRef, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ripple } from '@ngstarter/components/core';
import { TabNavBar } from '../tab-nav-bar/tab-nav-bar';

@Component({
  selector: 'a[ngs-tab-link]',
  standalone: true,
  styleUrl: './tab-link.scss',
  templateUrl: './tab-link.html',
  host: {
    'role': 'tab',
    'class': 'ngs-tab-link',
    '[class.ngs-tab-link-active]': 'active()',
    '[class.ngs-tab-link-disabled]': 'disabled()',
    '[attr.aria-selected]': 'active() ? "true" : "false"',
    '[attr.aria-disabled]': 'disabled() ? "true" : "false"',
    '[tabIndex]': 'disabled() ? -1 : 0',
    '[attr.aria-controls]': '_ariaControls()',
    '(click)': '_onClick($event)'
  },
  hostDirectives: [
    { directive: Ripple, inputs: ['ngsRippleDisabled: ngsRippleDisabled'] }
  ]
})
export class TabLink {
  private _el = inject(ElementRef<HTMLElement>);
  private _parent = inject(TabNavBar, { optional: true });
  private _routerLink = inject(RouterLink, { optional: true });

  // Whether the link is currently active
  readonly active = computed(() => {
    const parent = this._parent;
    if (!parent?.isActiveFn) {
      return false;
    }
    const fn = parent.isActiveFn();
    return fn(this);
  });

  // Whether the link is disabled
  disabled = input(false, { transform: booleanAttribute });

  // Optional external control to disable ripple on this link
  rippleDisabled = input(false, { alias: 'ngsRippleDisabled', transform: booleanAttribute });

  // Combined ripple disabled state: own disabled OR parent bar disableRipple OR explicit input
  get ngsRippleDisabled() {
    return this.disabled() || !!this._parent?.disableRipple() || this.rippleDisabled();
  }

  // Link should control the provided nav panel id when active
  _ariaControls() {
    const panel = this._parent?.tabPanel();
    return this.active() && panel ? panel.id : null;
  }

  // Prevent click when disabled, otherwise let parent handle focus/scroll
  _onClick(event: MouseEvent) {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  focus() { this._el.nativeElement.focus(); }
  get elementRef() { return this._el; }
}
