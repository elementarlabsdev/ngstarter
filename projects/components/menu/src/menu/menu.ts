import {
  Component,
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
  contentChild
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { MenuItem } from '../menu-item/menu-item';
import { MenuContent } from '../menu-content';
import { MenuCloseReason } from '../menu-types';
import { Subscription, merge, Subject, Observable } from 'rxjs';
import { MENU_TRIGGER } from '../menu-tokens';
import type { MenuTrigger } from '../menu-trigger';

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
  readonly role = input<'menu' | 'menubar'>('menu');
  readonly classList = input<string>('');
  readonly xPosition = input<'before' | 'after'>('after');
  readonly yPosition = input<'above' | 'below'>('below');

  protected readonly _panelClasses = signal<string[]>([]);
  readonly closed = output<MenuCloseReason>();
  readonly _childMenuClosed = new Subject<void>();

  readonly templateRef = viewChild.required(TemplateRef);
  readonly content = contentChild(MenuContent);
  readonly items = contentChildren(MenuItem, { descendants: true });

  protected readonly _isNested = signal(false);
  protected readonly _context = signal<any>(undefined);
  private _parentMenu = inject(Menu, { optional: true, skipSelf: true });
  private _parentMenuTrigger = inject<MenuTrigger>(MENU_TRIGGER, { optional: true });
  private _itemSubscription = Subscription.EMPTY;
  private _openedTrigger: any = null;

  constructor() {
    if (this._parentMenu || this._parentMenuTrigger) {
      this._isNested.set(true);
    }

    effect(() => {
      const items = this.items();
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
  }

  ngOnDestroy() {
    this._itemSubscription.unsubscribe();
  }

  close(reason: MenuCloseReason): void {
    if (this._openedTrigger) {
      this._openedTrigger.closeMenu(reason);
    }
    this.closed.emit(reason);
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
