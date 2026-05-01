import {
  Directive,
  inject,
  ElementRef,
  ViewContainerRef,
  OnDestroy,
  booleanAttribute,
  input,
  signal,
  output,
  forwardRef,
  Injector, DestroyRef
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Overlay, OverlayRef, OverlayConfig, ConnectedPosition, FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Menu } from './menu/menu';
import { MenuCloseReason } from './menu-types';
import { Subscription, merge, EMPTY, fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MENU_TRIGGER, MENU_ITEM } from './menu-tokens';

@Directive({
  selector: '[ngsMenuTriggerFor]',
  exportAs: 'ngsMenuTrigger',
  standalone: true,
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'menuOpen()',
    '[attr.aria-controls]': 'menuOpen() ? menu()?.templateRef() : null',
    '[class.ngs-menu-item-highlighted]': 'menuOpen()',
    '(click)': '_handleClick($event)',
    '(mouseenter)': '_handleMouseEnter()',
    '(mouseleave)': '_handleMouseLeave()',
  },
  providers: [
    {
      provide: MENU_TRIGGER,
      useExisting: forwardRef(() => MenuTrigger)
    }
  ]
})
export class MenuTrigger implements OnDestroy {
  private _overlay = inject(Overlay);
  private _elementRef = inject(ElementRef<HTMLElement>);
  private _viewContainerRef = inject(ViewContainerRef);
  private destroyRef = inject(DestroyRef);
  private _injector = inject(Injector);
  private _parentMenu = inject(Menu, { optional: true, skipSelf: true });
  private _menu = inject(Menu, { optional: true });

  readonly menu = input<Menu | null>(null, { alias: 'ngsMenuTriggerFor' });
  readonly menuData = input<any>(undefined, { alias: 'ngsMenuTriggerData' });
  readonly menuDisabled = input(false, { transform: booleanAttribute, alias: 'ngsMenuDisabled' });
  readonly xPosition = input<'before' | 'after'>('after');
  readonly yPosition = input<'above' | 'below'>('below');

  readonly menuOpened = output<void>();
  readonly menuClosed = output<MenuCloseReason>();
  readonly restoreFocus = input(true, { transform: booleanAttribute, alias: 'ngsMenuTriggerRestoreFocus' });

  private _overlayRef: OverlayRef | null = null;
  private _portal: TemplatePortal | null = null;
  private _closingSubscription = Subscription.EMPTY;
  private _hoverSubscription = Subscription.EMPTY;
  private _childMenuClosedSubscription = Subscription.EMPTY;
  private _closeTimeoutId: any;
  private _previouslyFocusedElement: HTMLElement | null = null;

  readonly menuOpen = signal(false);

  ngOnDestroy() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
    this._closingSubscription.unsubscribe();
    this._hoverSubscription.unsubscribe();
    this._childMenuClosedSubscription.unsubscribe();
    this._clearCloseTimeout();
  }

  _handleMouseLeave() {
  }

  _clearCloseTimeout() {
    if (this._closeTimeoutId) {
      clearTimeout(this._closeTimeoutId);
      this._closeTimeoutId = null;
    }
  }

  _handleClick(event: MouseEvent): void {
    const menuItem = this._injector.get(MENU_ITEM, null);
    if (menuItem) {
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    this.toggleMenu();
  }

  toggleMenu(): void {
    if (this.menuDisabled()) {
      return;
    }

    if (this._parentMenu) {
      this.openMenu();
    } else {
      this.menuOpen() ? this.closeMenu('click') : this.openMenu();
    }
  }

  openMenu(): void {
    const menu = this.menu();
    if (this.menuOpen() || !menu) {
      return;
    }

    this._previouslyFocusedElement = document.activeElement as HTMLElement;
    const overlayRef = this._createOverlay();
    const strategy = overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;

    strategy.positionChanges.subscribe(change => {
      menu._setPanelClasses(this._getPanelClasses(change.connectionPair));
    });

    menu._setContext(this.menuData());
    this._portal = new TemplatePortal(menu.templateRef(), this._viewContainerRef, this._viewContainerRef.injector);
    overlayRef.attach(this._portal);

    if (overlayRef.hasAttached()) {
      this._setIsMenuOpen(true);

      const overlayElement = overlayRef.overlayElement;
      this._hoverSubscription.unsubscribe();
      this._hoverSubscription = merge(
        fromEvent<MouseEvent>(overlayElement, 'mouseenter'),
        fromEvent<MouseEvent>(overlayElement, 'mouseleave')
      ).subscribe(event => {
        if (event.type === 'mouseenter') {
          this._clearCloseTimeout();
        } else {
          this._handleMouseLeave();
        }
      });
    }

    if (this._menu) {
      this._menu._triggerOpened(this);

      this._childMenuClosedSubscription.unsubscribe();
      this._childMenuClosedSubscription = this._menu._childMenuClosed.subscribe(() => {
        this._handleMouseLeave();
      });
    }

    this._closingSubscription = this._menuClosingActions().subscribe(reason => this.closeMenu(reason));
    this.menuOpened.emit();
  }

  closeMenu(reason: MenuCloseReason, force = false): void {
    if (!this._overlayRef || !this.menuOpen()) {
      return;
    }

    if (!force && reason === 'mouse' && this.menu()?.hasOpenChild()) {
      return;
    }

    this._setIsMenuOpen(false);
    const menu = this.menu();

    if (menu) {
      menu.close(reason);
    }

    if (this._menu) {
      this._menu._triggerClosed(this);
    }

    this._overlayRef.detach();
    this._closingSubscription.unsubscribe();
    this._hoverSubscription.unsubscribe();
    this._childMenuClosedSubscription.unsubscribe();
    this._clearCloseTimeout();
    this.menuClosed.emit(reason);

    if (this.restoreFocus() && this._previouslyFocusedElement) {
      this._previouslyFocusedElement.focus();
    }

    this._previouslyFocusedElement = null;

    if (reason === 'click' && this._parentMenu) {
      this._parentMenu.close('click');
    }
  }

  private _setIsMenuOpen(isOpen: boolean): void {
    this.menuOpen.set(isOpen);
  }

  private _getPanelClasses(connectionPair: ConnectedPosition): string[] {
    const classes = [];
    const isBelow = connectionPair.overlayY === 'top';
    const isBefore = connectionPair.overlayX === 'end';

    if (isBelow) {
      classes.push('ngs-menu-below');
    } else {
      classes.push('ngs-menu-above');
    }

    if (isBefore) {
      classes.push('ngs-menu-before');
    } else {
      classes.push('ngs-menu-after');
    }

    return classes;
  }

  private _createOverlay(): OverlayRef {
    if (!this._overlayRef) {
      const config = this._getOverlayConfig();
      this._overlayRef = this._overlay.create(config);
      this._overlayRef
        .keydownEvents()
        .pipe(filter(event => event.key === 'Escape'))
        .subscribe(() => this.closeMenu('keydown'));
      this._overlayRef
        .outsidePointerEvents()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event) => {
          if (this._parentMenu && this._elementRef.nativeElement.contains(event.target as HTMLElement)) {
            return;
          }
          this.closeMenu('backdrop');
        });
    }
    return this._overlayRef;
  }

  private _getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: this._overlay.position()
        .flexibleConnectedTo(this._elementRef)
        .withLockedPosition(false)
        .withTransformOriginOn('.ngs-menu-panel')
        .withPositions(this._getPositions())
        .withPush(false),
      scrollStrategy: this._overlay.scrollStrategies.block(),
      hasBackdrop: !this._parentMenu,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });
  }

  private _getPositions(): ConnectedPosition[] {
    const menu = this.menu();

    if (this._parentMenu) {
      return [
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: 0,
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'top',
          offsetX: 0,
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetX: 0,
        },
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'bottom',
          offsetX: 0,
        }
      ];
    }

    const xPosition = menu?.xPosition() || this.xPosition();
    const yPosition = menu?.yPosition() || this.yPosition();

    if (yPosition === 'above') {
      return [
        {
          originX: xPosition === 'before' ? 'end' : 'start',
          originY: 'top',
          overlayX: xPosition === 'before' ? 'end' : 'start',
          overlayY: 'bottom',
        },
        {
          originX: xPosition === 'before' ? 'start' : 'end',
          originY: 'top',
          overlayX: xPosition === 'before' ? 'start' : 'end',
          overlayY: 'bottom',
        },
        {
          originX: xPosition === 'before' ? 'end' : 'start',
          originY: 'bottom',
          overlayX: xPosition === 'before' ? 'end' : 'start',
          overlayY: 'top',
        },
        {
          originX: xPosition === 'before' ? 'start' : 'end',
          originY: 'bottom',
          overlayX: xPosition === 'before' ? 'start' : 'end',
          overlayY: 'top',
        },
      ];
    }

    return [
      {
        originX: xPosition === 'before' ? 'end' : 'start',
        originY: 'bottom',
        overlayX: xPosition === 'before' ? 'end' : 'start',
        overlayY: 'top',
      },
      {
        originX: xPosition === 'before' ? 'start' : 'end',
        originY: 'bottom',
        overlayX: xPosition === 'before' ? 'start' : 'end',
        overlayY: 'top',
      },
      {
        originX: xPosition === 'before' ? 'end' : 'start',
        originY: 'top',
        overlayX: xPosition === 'before' ? 'end' : 'start',
        overlayY: 'bottom',
      },
      {
        originX: xPosition === 'before' ? 'start' : 'end',
        originY: 'top',
        overlayX: xPosition === 'before' ? 'start' : 'end',
        overlayY: 'bottom',
      },
    ];
  }

  private _menuClosingActions() {
    const menu = this.menu();
    const detachments = this._overlayRef!.detachments();
    const menuClosed = menu ? outputToObservable(menu.closed) : EMPTY;
    const parentMenuClosed = this._parentMenu ? outputToObservable(this._parentMenu.closed) : EMPTY;
    return merge(detachments, menuClosed, parentMenuClosed).pipe(
      filter((reason): reason is MenuCloseReason => !!reason)
    );
  }

  _handleMouseEnter() {
    this._clearCloseTimeout();
    if (this._parentMenu) {
      this.openMenu();
    } else if (this._menu) {
      this.openMenu();
    }
  }
}
