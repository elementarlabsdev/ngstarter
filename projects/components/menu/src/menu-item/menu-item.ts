import {
  Component,
  ChangeDetectionStrategy,
  input,
  booleanAttribute,
  inject,
  ElementRef,
  output,
  signal,
  forwardRef,
  Injector,
  OnInit,
  OnDestroy
} from '@angular/core';
import { MENU_ITEM, MENU_TRIGGER } from '../menu-tokens';
import type { MenuTrigger } from '../menu-trigger';
import { Menu } from '../menu/menu';

@Component({
  selector: 'ngs-menu-item, [ngs-menu-item]',
  exportAs: 'ngsMenuItem',
  standalone: true,
  imports: [],
  templateUrl: './menu-item.html',
  styleUrl: './menu-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MENU_ITEM,
      useExisting: forwardRef(() => MenuItem)
    }
  ],
  host: {
    '[attr.role]': 'role()',
    '[class.ngs-menu-item]': 'true',
    '[class.ngs-menu-item-highlighted]': '_isHighlighted() || selected()',
    '[attr.disabled]': 'disabled() || null',
    '[attr.aria-disabled]': 'disabled()',
    '[tabindex]': 'disabled() || (_menu && !_menu._isItemActive(this)) ? -1 : 0',
    '(click)': '_handleClick($event)',
    '(keydown)': '_handleKeydown($event)',
    '(focus)': '_handleFocus()',
    '(mouseenter)': '_handleMouseEnter()',
  }
})
export class MenuItem implements OnInit, OnDestroy {
  private _injector = inject(Injector);
  protected _menuTrigger: MenuTrigger | null = null;
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly role = input<'menuitem' | 'menuitem-radio' | 'menuitem-checkbox'>('menuitem');

  selected = input(false, {
    transform: booleanAttribute
  });

  readonly _triggered = output<void>();

  private _elementRef = inject(ElementRef<HTMLElement>);
  protected _menu = inject(Menu, { optional: true });
  /** Adapt signal-based inputs to the CDK FocusableOption contract. */
  readonly _navigationItem: { item: MenuItem; disabled: boolean; getLabel(): string; focus(): void } = {
    item: this,
    get disabled(): boolean { return this.item.disabled(); },
    getLabel(): string { return this.item.label; },
    focus(): void { this.item.focus(); },
  };

  get element(): HTMLElement { return this._elementRef.nativeElement; }

  get label(): string {
    return this._elementRef.nativeElement.textContent?.trim() || '';
  }

  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  ngOnInit() {
    this._menuTrigger = this._injector.get(MENU_TRIGGER, null);
    this._menu?._registerItem(this);
  }

  ngOnDestroy(): void {
    this._menu?._unregisterItem(this);
  }

  _handleFocus(): void {
    this._menu?._setActiveItem(this);
  }

  _handleKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.target !== this.element || this.disabled()) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.element.click();
    }
  }

  _openSubmenu(): boolean {
    if (!this._menuTrigger || this.disabled()) {
      return false;
    }
    this._menuTrigger.openMenu('first');
    return true;
  }

  _handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const menuTrigger = this._menuTrigger;
    const hasPopup = this._elementRef.nativeElement.getAttribute('aria-haspopup');
    if (menuTrigger || hasPopup === 'menu') {
      return;
    }

    this._triggered.emit();
  }

  _handleMouseEnter(): void {
    const menuTrigger = this._menuTrigger;
    if (this._menu && !menuTrigger) {
      this._menu._triggerOpened(null);
    }
  }

  protected readonly _isHighlighted = signal(false);
}
