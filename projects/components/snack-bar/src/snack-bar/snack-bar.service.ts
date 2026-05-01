import {
  Injectable,
  Injector,
  ComponentRef,
  TemplateRef,
  Type,
  inject,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { SnackBarConfig, SNACK_BAR_DATA, SNACK_BAR_CONFIG } from './snack-bar-config';
import { SnackBarRef } from './snack-bar-ref';
import { SnackBarContainer } from './snack-bar-container/snack-bar-container';
import { SimpleSnackBar } from './simple-snack-bar/simple-snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackBar {
  private _overlay = inject(Overlay);
  private _injector = inject(Injector);
  private _parentSnackBar = inject(SnackBar, { optional: true, skipSelf: true });
  private _defaultConfig = inject(SNACK_BAR_CONFIG, { optional: true }) ?? new SnackBarConfig();

  /** Reference to the currently-opened snack bar. */
  private _openedSnackBarRef: SnackBarRef<any> | null = null;

  /**
   * Opens a snack bar with a message and an optional action.
   */
  open(message: string, action?: string, config?: SnackBarConfig): SnackBarRef<SimpleSnackBar> {
    const _config = { ...this._defaultConfig, ...config };
    _config.data = { message, action };

    return this.openFromComponent(SimpleSnackBar, _config);
  }

  /**
   * Opens a snack bar with a custom component.
   */
  openFromComponent<T>(component: Type<T>, config?: SnackBarConfig): SnackBarRef<T> {
    return this._attach(component, config) as SnackBarRef<T>;
  }

  /**
   * Opens a snack bar with a custom template.
   */
  openFromTemplate(template: TemplateRef<any>, config?: SnackBarConfig): SnackBarRef<any> {
    return this._attach(template, config);
  }

  /**
   * Dismisses the currently-visible snack bar.
   */
  dismiss(): void {
    if (this._openedSnackBarRef) {
      this._openedSnackBarRef.dismiss();
    }
  }

  /**
   * Attaches the snack bar container and the appropriate content.
   */
  private _attach<T>(content: Type<T> | TemplateRef<T>, config?: SnackBarConfig): SnackBarRef<T | any> {
    const _config = { ...this._defaultConfig, ...config };
    const overlayRef = this._createOverlay(_config);
    const container = this._attachContainer(overlayRef, _config);
    const snackBarRef = new SnackBarRef<T | any>(container, overlayRef);

    if (content instanceof TemplateRef) {
      const portal = new TemplatePortal(content, null!, {
        $implicit: _config.data,
        snackBarRef,
      } as any);
      snackBarRef.instance = container.attachTemplatePortal(portal);
    } else {
      const injector = this._createInjector(_config, snackBarRef);
      const portal = new ComponentPortal(content, undefined, injector);
      const contentRef = container.attachComponentPortal(portal);
      snackBarRef.instance = contentRef.instance;
    }

    // If there is another snack bar already opened, dismiss it before showing the new one.
    if (this._openedSnackBarRef) {
      const oldSnackBarRef = this._openedSnackBarRef;
      oldSnackBarRef.afterDismissed().subscribe(() => {
        container.enter();
      });
      oldSnackBarRef.dismiss();
    } else {
      container.enter();
    }

    this._openedSnackBarRef = snackBarRef;
    snackBarRef.afterDismissed().subscribe(() => {
      if (this._openedSnackBarRef === snackBarRef) {
        this._openedSnackBarRef = null;
      }
    });

    if (_config.duration && _config.duration > 0) {
      setTimeout(() => snackBarRef.dismiss(), _config.duration);
    }

    return snackBarRef;
  }

  /**
   * Creates a new overlay and configures it for the snack bar.
   */
  private _createOverlay(config: SnackBarConfig): OverlayRef {
    const overlayConfig = new OverlayConfig({
      direction: config.direction,
      hasBackdrop: false,
      scrollStrategy: this._overlay.scrollStrategies.noop(),
      positionStrategy: this._overlay.position()
        .global()
        .centerHorizontally()
        .bottom('0'),
    });

    // Custom positioning based on config
    const positionStrategy = this._overlay.position().global();

    if (config.horizontalPosition === 'start' || config.horizontalPosition === 'left') {
      positionStrategy.left('0');
    } else if (config.horizontalPosition === 'end' || config.horizontalPosition === 'right') {
      positionStrategy.right('0');
    } else {
      positionStrategy.centerHorizontally();
    }

    if (config.verticalPosition === 'top') {
      positionStrategy.top('0');
    } else {
      positionStrategy.bottom('0');
    }

    overlayConfig.positionStrategy = positionStrategy;

    return this._overlay.create(overlayConfig);
  }

  /**
   * Attaches the snack bar container to the overlay.
   */
  private _attachContainer(overlayRef: OverlayRef, config: SnackBarConfig): SnackBarContainer {
    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const injector = Injector.create({
      parent: userInjector || this._injector,
      providers: [{ provide: SnackBarConfig, useValue: config }],
    });

    const containerPortal = new ComponentPortal(SnackBarContainer, config.viewContainerRef, injector);
    const containerRef: ComponentRef<SnackBarContainer> = overlayRef.attach(containerPortal);

    return containerRef.instance;
  }

  /**
   * Creates an injector to be used inside of a snack bar component.
   */
  private _createInjector<T>(config: SnackBarConfig, snackBarRef: SnackBarRef<T>): Injector {
    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;

    return Injector.create({
      parent: userInjector || this._injector,
      providers: [
        { provide: SnackBarRef, useValue: snackBarRef },
        { provide: SNACK_BAR_DATA, useValue: config.data },
      ],
    });
  }
}
