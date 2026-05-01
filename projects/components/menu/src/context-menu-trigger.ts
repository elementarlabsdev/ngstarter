import {
  Directive,
  inject,
  ElementRef,
  ViewContainerRef,
  OnDestroy,
  input,
  signal,
  output,
  NgZone
} from '@angular/core';
import {
  Overlay,
  OverlayRef,
  OverlayConfig,
  ConnectedPosition,
  FlexibleConnectedPositionStrategy
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Menu } from './menu/menu';
import { MenuCloseReason } from './menu-types';
import { Subscription, merge, EMPTY } from 'rxjs';
import { filter } from 'rxjs/operators';
import { outputToObservable } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[ngsContextMenuTriggerFor]',
  exportAs: 'ngsContextMenuTrigger',
  standalone: true,
  host: {
    '(contextmenu)': '_handleContextMenu($event)',
  }
})
export class ContextMenuTrigger implements OnDestroy {
  private _overlay = inject(Overlay);
  private _elementRef = inject(ElementRef<HTMLElement>);
  private _viewContainerRef = inject(ViewContainerRef);
  private _ngZone = inject(NgZone);

  readonly menu = input<Menu | null>(null, { alias: 'ngsContextMenuTriggerFor' });
  readonly menuData = input<any>(undefined, { alias: 'ngsContextMenuTriggerData' });

  readonly menuOpened = output<void>();
  readonly menuClosed = output<MenuCloseReason>();

  private _overlayRef: OverlayRef | null = null;
  private _portal: TemplatePortal | null = null;
  private _closingSubscription = Subscription.EMPTY;

  readonly menuOpen = signal(false);

  ngOnDestroy() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
    this._closingSubscription.unsubscribe();
  }

  openMenu(x: number, y: number): void {
    const menu = this.menu();
    if (this.menuOpen() || !menu) {
      return;
    }

    const overlayRef = this._createOverlay(x, y);
    const strategy = overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;

    strategy.positionChanges.subscribe(change => {
      menu._setPanelClasses(this._getPanelClasses(change.connectionPair));
    });

    menu._setContext(this.menuData());
    this._portal = new TemplatePortal(menu.templateRef(), this._viewContainerRef);
    overlayRef.attach(this._portal);

    if (overlayRef.hasAttached()) {
      this._setIsMenuOpen(true);
    }

    this._closingSubscription = this._menuClosingActions().subscribe(reason => this.closeMenu(reason));
    this.menuOpened.emit();
  }

  closeMenu(reason: MenuCloseReason): void {
    if (!this._overlayRef || !this.menuOpen()) {
      return;
    }

    this._setIsMenuOpen(false);
    const menu = this.menu();

    if (menu) {
      menu.close(reason);
    }

    this._overlayRef.detach();
    this._closingSubscription.unsubscribe();
    this.menuClosed.emit(reason);
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

  private _createOverlay(x: number, y: number): OverlayRef {
    if (this._overlayRef) {
      this._overlayRef.updatePositionStrategy(this._getPositionStrategy(x, y));
      return this._overlayRef;
    }

    const config = this._getOverlayConfig(x, y);
    this._overlayRef = this._overlay.create(config);

    this._overlayRef.keydownEvents()
      .pipe(filter(event => event.key === 'Escape'))
      .subscribe(() => this.closeMenu('keydown'));

    this._overlayRef.backdropClick().subscribe(() => this.closeMenu('backdrop'));

    return this._overlayRef;
  }

  private _getOverlayConfig(x: number, y: number): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: this._getPositionStrategy(x, y),
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
  }

  private _getPositionStrategy(x: number, y: number): FlexibleConnectedPositionStrategy {
    return this._overlay.position()
      .flexibleConnectedTo({ x, y })
      .withPush(false)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom',
        },
      ]);
  }

  private _menuClosingActions() {
    const menu = this.menu();
    const detachments = this._overlayRef!.detachments();
    const menuClosed = menu ? outputToObservable(menu.closed) : EMPTY;
    return merge(detachments, menuClosed).pipe(
      filter((reason): reason is MenuCloseReason => !!reason)
    );
  }

  _handleContextMenu(event: MouseEvent): void {
    event.preventDefault();

    if (this.menuOpen()) {
      this.closeMenu('click');
    }

    this.openMenu(event.clientX, event.clientY);
  }
}
