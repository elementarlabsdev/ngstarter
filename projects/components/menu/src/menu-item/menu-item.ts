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
  OnInit
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
    '[tabindex]': 'disabled() ? -1 : 0',
    '(click)': '_handleClick($event)',
    '(mouseenter)': '_handleMouseEnter()',
  }
})
export class MenuItem implements OnInit {
  private _injector = inject(Injector);
  protected _menuTrigger: MenuTrigger | null = null;
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly role = input<'menuitem' | 'menuitem-radio' | 'menuitem-checkbox'>('menuitem');

  selected = input(false, {
    transform: booleanAttribute
  });

  readonly _triggered = output<void>();

  private _elementRef = inject(ElementRef<HTMLElement>);
  private _menu = inject(Menu, { optional: true });

  get label(): string {
    return this._elementRef.nativeElement.textContent?.trim() || '';
  }

  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  ngOnInit() {
    this._menuTrigger = this._injector.get(MENU_TRIGGER, null);
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
