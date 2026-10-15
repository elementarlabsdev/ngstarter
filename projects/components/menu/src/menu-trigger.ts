import { bindNgsOverlayTheme } from '@ngstarter-ui/components/core';
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
    '[attr.aria-controls]': 'menuOpen() ? menu()?.id : null',
    '[class.ngs-menu-item-highlighted]': 'menuOpen()',
    '(click)': '_handleClick($event)',
    '(keydown)': '_handleKeydown($event)',
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
    this.themeCleanup?.(); this.themeCleanup = null;
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
    if (event.detail === 0 && !this.menuOpen()) {
      this.openMenu('first');
    } else {
      this.toggleMenu();
    }
  }

  _handleKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || this.menuDisabled() || event.target !== this._elementRef.nativeElement) {
      return;
    }
    if (event.key === 'Tab' && this.menuOpen()) {
      this.closeMenu('tab');
      return;
    }
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      const edge = event.key === 'ArrowUp' ? 'last' : 'first';
      if (this.menuOpen()) {
        this.menu()?._focusPanel(edge);
      } else {
        this.openMenu(edge);
      }
    }
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

  private themeCleanup: (() => void) | null = null;

  openMenu(focus: 'first' | 'last' | null = null): void {
    const menu = this.menu();
    if (this.menuDisabled() || this._injector.get(MENU_ITEM, null)?.disabled() || this.menuOpen() || !menu) {
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
    this.themeCleanup?.();
    const themeSource = menu.themeSource();
    this.themeCleanup = themeSource ? bindNgsOverlayTheme(themeSource, overlayRef.overlayElement) : null;

    if (overlayRef.hasAttached()) {
      this._setIsMenuOpen(true);
      menu._openPanel(this._elementRef.nativeElement, this._menu ?? this._parentMenu, focus,
        reason => this.closeMenu(reason));

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
    menu?._closePanel(reason);

    if (this._menu) {
      this._menu._triggerClosed(this);
    }

    this.themeCleanup?.(); this.themeCleanup = null;
    this._overlayRef.detach();
    this._closingSubscription.unsubscribe();
    this._hoverSubscription.unsubscribe();
    this._childMenuClosedSubscription.unsubscribe();
    this._clearCloseTimeout();
    this.menuClosed.emit(reason);

    if (reason !== 'tab' && this.restoreFocus() && this._previouslyFocusedElement) {
      this._previouslyFocusedElement.focus();
    }

    this._previouslyFocusedElement = null;

    const parent = this._menu ?? this._parentMenu;
    if (reason === 'click' && parent) {
      parent.close('click');
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
        .withFlexibleDimensions(!this.menu()?.pushIntoViewport())
        .withPush(this.menu()?.pushIntoViewport() ?? false)
        .withViewportMargin(this.menu()?.pushIntoViewport() ? 8 : 0),
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
