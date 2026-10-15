import {
  Component,
  booleanAttribute,
  ChangeDetectionStrategy,
  viewChild,
  TemplateRef,
  contentChildren,
  input,
  signal,
  inject,
  OnDestroy,
  output,
  effect,
  contentChild,
  computed,
  ElementRef,
  Injector,
  untracked
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { MenuItem } from '../menu-item/menu-item';
import { MenuContent } from '../menu-content';
import { MenuCloseReason } from '../menu-types';
import { Subscription, merge, Subject, Observable } from 'rxjs';
import { MENU_TRIGGER } from '../menu-tokens';
import type { MenuTrigger } from '../menu-trigger';
import { Directionality } from '@angular/cdk/bidi';
import {
  createDropdownFocusKeyManager, isDropdownItemHidden, isDropdownTextInput,
  scrollDropdownItemIntoView
} from '@ngstarter-ui/components/core';

@Component({
  selector: 'ngs-menu',
  exportAs: 'ngsMenu',
  standalone: true,
  imports: [
    NgTemplateOutlet
  ],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'role()',
    '[class.ngs-menu]': 'true',
  }
})
export class Menu implements OnDestroy {
  private static _nextId = 0;
  readonly id = `ngs-menu-${Menu._nextId++}`;
  private readonly _panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly _registeredItems = signal<MenuItem[]>([]);
  private readonly _navigationItems = computed(() => this._registeredItems()
    .slice().sort((a, b) => a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1)
    .map(item => item._navigationItem));
  private readonly _keyManager = createDropdownFocusKeyManager(this._navigationItems, inject(Injector), {
    skip: option => option.disabled || isDropdownItemHidden(option.item.element),
  });
  private readonly _direction = inject(Directionality, { optional: true });
  private readonly _panelOpen = signal(false);
  private _pendingFocus: 'first' | 'last' | null = null;
  private _keyboardNavigation = false;
  private _panelTrigger: HTMLElement | null = null;
  private _parentPanel: Menu | null = null;
  private _panelClose: ((reason: MenuCloseReason) => void) | null = null;
  /** Optional scope whose tokens should follow this detached overlay. */
  readonly themeSource = input<HTMLElement | null>(null);
  readonly role = input<'menu' | 'menubar'>('menu');
  readonly classList = input<string>('');
  readonly xPosition = input<'before' | 'after'>('after');
  readonly yPosition = input<'above' | 'below'>('below');
  /** Keep the panel's own dimensions and shift it inside the viewport when needed. */
  readonly pushIntoViewport = input(false, { transform: booleanAttribute });

  protected readonly _panelClasses = signal<string[]>([]);
  readonly closed = output<MenuCloseReason>();
  readonly _childMenuClosed = new Subject<void>();

  readonly templateRef = viewChild.required(TemplateRef);
  readonly content = contentChild(MenuContent);
  readonly items = contentChildren(MenuItem, { descendants: true });

  protected readonly _isNested = signal(false);
  protected readonly _context = signal<any>(undefined);
  readonly context = this._context.asReadonly();
  private _parentMenu = inject(Menu, { optional: true, skipSelf: true });
  private _parentMenuTrigger = inject<MenuTrigger>(MENU_TRIGGER, { optional: true });
  private _itemSubscription = Subscription.EMPTY;
  private _openedTrigger: any = null;

  constructor() {
    if (this._parentMenu || this._parentMenuTrigger) {
      this._isNested.set(true);
    }

    effect(() => {
      const items = this._registeredItems();
      this._itemSubscription.unsubscribe();

      if (items.length > 0) {
        this._itemSubscription = merge(
          ...items.map(item => outputToObservable(item._triggered) as Observable<any>)
        )
        .subscribe(() => {
          this.close('click');
        });
      }
    });
    effect(() => {
      const panel = this._panel();
      const open = this._panelOpen();
      const items = this._navigationItems();
      const active = this._keyManager.activeItem;
      untracked(() => {
        if (open && panel && items.length && (this._pendingFocus || (!active && this._keyboardNavigation)) &&
            !isDropdownTextInput(document.activeElement)) {
          if (this._pendingFocus === 'last') {
            this._keyManager.setLastItemActive();
          } else {
            this._keyManager.setFirstItemActive();
          }
          this._pendingFocus = null;
        }
      });
    });
    this._keyManager.change.subscribe(() => {
      const item = this._keyManager.activeItem;
      const panel = this._panel()?.nativeElement;
      if (item && panel) {
        scrollDropdownItemIntoView(item.item.element, panel);
      }
    });
  }

  ngOnDestroy() {
    this._itemSubscription.unsubscribe();
    this._keyManager.destroy();
  }

  close(reason: MenuCloseReason): void {
    this._panelClose?.(reason);
  }

  _registerItem(item: MenuItem): void {
    this._registeredItems.update(items => [...items, item]);
  }

  _unregisterItem(item: MenuItem): void {
    this._registeredItems.update(items => items.filter(current => current !== item));
  }

  _isItemActive(item: MenuItem): boolean {
    return this._keyManager.activeItem?.item === item;
  }

  _setActiveItem(item: MenuItem): void {
    this._keyboardNavigation = true;
    this._keyManager.updateActiveItem(item._navigationItem);
  }

  _focusPanel(edge: 'first' | 'last'): void {
    this._keyboardNavigation = true;
    this._pendingFocus = edge;
    if (edge === 'last') {
      this._keyManager.setLastItemActive();
    } else {
      this._keyManager.setFirstItemActive();
    }
    if (this._keyManager.activeItem) {
      this._pendingFocus = null;
    }
  }

  _openPanel(
    trigger: HTMLElement, parent: Menu | null, focus: 'first' | 'last' | null,
    close: (reason: MenuCloseReason) => void,
  ): void {
    this._panelTrigger = trigger;
    this._parentPanel = parent;
    this._pendingFocus = focus;
    this._keyboardNavigation = focus !== null;
    this._panelClose = close;
    this._panelOpen.set(true);
  }

  _closePanel(reason: MenuCloseReason): void {
    this._openedTrigger?.closeMenu(reason, true);
    this._panelOpen.set(false);
    this._panelClose = null;
    this._pendingFocus = null;
    this._keyManager.updateActiveItem(-1);
    this._keyManager.cancelTypeahead();
    this.closed.emit(reason);
  }

  protected _handleKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.isComposing) {
      return;
    }
    const rtl = this._direction?.value === 'rtl';
    if (event.key === 'Escape' || (this._parentPanel && event.key === (rtl ? 'ArrowRight' : 'ArrowLeft'))) {
      event.preventDefault();
      event.stopPropagation();
      this.close('keydown');
    } else if (event.key === 'Tab') {
      let root: Menu = this;
      while (root._parentPanel) {
        root = root._parentPanel;
      }
      root._panelTrigger?.focus();
      this.close('tab');
      if (root !== this) {
        root.close('tab');
      }
      // Keep the browser's default Tab action, starting from the root trigger.
      event.stopPropagation();
    } else if (isDropdownTextInput(event.target)) {
      return;
    } else if (event.key === (rtl ? 'ArrowLeft' : 'ArrowRight') &&
               this._keyManager.activeItem?.item._openSubmenu()) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      this._keyManager.onKeydown(event);
    }
  }

  _setPanelClasses(classes: string[]): void {
    this._panelClasses.set(classes);
  }

  _setContext(context: any): void {
    this._context.set(context);
  }

  _triggerOpened(trigger: any): void {
    if (this._openedTrigger && this._openedTrigger !== trigger) {
      this._openedTrigger.closeMenu('mouse', true);
    }
    this._openedTrigger = trigger;
  }

  _triggerClosed(trigger: any): void {
    if (this._openedTrigger === trigger) {
      this._openedTrigger = null;
      this._childMenuClosed.next();
    }
  }

  hasOpenChild(): boolean {
    return !!this._openedTrigger && this._openedTrigger.menuOpen();
  }
}
