import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  ViewContainerRef,
  InjectionToken,
  effect,
  numberAttribute,
  PLATFORM_ID,
} from '@angular/core';
import {
  Overlay,
  OverlayRef,
  OverlayConfig,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipContent } from './tooltip/tooltip-content';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Directionality } from '@angular/cdk/bidi';
import { isPlatformBrowser } from '@angular/common';

export type TooltipPosition = 'left' | 'right' | 'above' | 'below' | 'before' | 'after';

export interface TooltipDefaultOptions {
  showDelay: number;
  hideDelay: number;
  touchendHideDelay: number;
  position?: TooltipPosition;
  offset?: number;
}

export const TOOLTIP_DEFAULT_OPTIONS = new InjectionToken<TooltipDefaultOptions>(
  'TOOLTIP_DEFAULT_OPTIONS',
  {
    providedIn: 'root',
    factory: () => ({
      showDelay: 0,
      hideDelay: 0,
      touchendHideDelay: 1500,
      offset: 6,
    }),
  }
);

@Directive({
  selector: '[ngsTooltip]',
  exportAs: 'ngsTooltip',
  standalone: true,
  host: {
    '(mouseenter)': 'show($event)',
    '(mouseleave)': 'hide()',
    '(focus)': 'show($event)',
    '(blur)': 'hide()',
    '(mousedown)': '_handleMousedown($event)',
    '(touchstart)': '_handleTouchstart($event)',
  },
})
export class Tooltip implements OnDestroy {
  private _overlay = inject(Overlay);
  private _elementRef = inject(ElementRef<HTMLElement>);
  private _viewContainerRef = inject(ViewContainerRef);
  private _dir = inject(Directionality);
  private _defaultOptions = inject(TOOLTIP_DEFAULT_OPTIONS);
  private _platformId = inject(PLATFORM_ID);

  private _overlayRef: OverlayRef | null = null;
  private _tooltipInstance: TooltipContent | null = null;
  private _portal: ComponentPortal<TooltipContent> | null = null;

  private readonly _destroyed = new Subject<void>();

  private _lastPositionAtOrigin: { x: number, y: number } | null = null;

  private _isContentHovered = false;
  private _hideTimeoutId: number | null = null;

  readonly message = input('', { alias: 'ngsTooltip' });
  readonly position = input<TooltipPosition>('below', { alias: 'ngsTooltipPosition' });
  readonly tooltipClass = input<any>('', { alias: 'ngsTooltipClass' });
  readonly showDelay = input<number, any>(this._defaultOptions.showDelay, {
    alias: 'ngsTooltipShowDelay',
    transform: numberAttribute
  });
  readonly hideDelay = input<number, any>(this._defaultOptions.hideDelay, {
    alias: 'ngsTooltipHideDelay',
    transform: numberAttribute
  });
  readonly offset = input(this._defaultOptions.offset || 6, { alias: 'ngsTooltipOffset' });
  readonly positionAtOrigin = input<boolean, any>(false, {
    alias: 'ngsTooltipPositionAtOrigin',
    transform: (value: any) => {
      if (typeof value === 'string') {
        return value === '' || value === 'true';
      }
      return !!value;
    }
  });
  readonly disabled = input<boolean, any>(false, {
    alias: 'ngsTooltipDisabled',
    transform: (value: any) => {
      if (typeof value === 'string') {
        return value === '' || value === 'true';
      }
      return !!value;
    }
  });

  constructor() {
    effect(() => {
      const message = this.message();
      if (this._tooltipInstance) {
        this._tooltipInstance.message = message;
      }
    });

    effect(() => {
      const tooltipClass = this.tooltipClass();
      if (this._tooltipInstance) {
        this._tooltipInstance.tooltipClass = tooltipClass;
      }
    });

    effect(() => {
      this.position();
      this.offset();
      if (this._overlayRef) {
        this._updatePosition();
      }
    });

    effect(() => {
      if (this.disabled()) {
        this.hideImmediately();
      }
    });
  }

  ngOnDestroy() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._tooltipInstance = null;
    }
    this._isContentHovered = false;
    this._destroyed.next();
    this._destroyed.complete();
  }

  show(event?: MouseEvent | TouchEvent | FocusEvent, delay: number = this.showDelay()): void {
    if (this._hideTimeoutId) {
      if (isPlatformBrowser(this._platformId)) {
        window.clearTimeout(this._hideTimeoutId);
      } else {
        clearTimeout(this._hideTimeoutId);
      }
      this._hideTimeoutId = null;
    }

    if (!this.message() || this.disabled()) {
      return;
    }

    const isVisible = this._tooltipInstance?.isVisible();

    if (event instanceof Event && this.positionAtOrigin()) {
      if (!isVisible) {
        this._lastPositionAtOrigin = this._getOrigin(event as MouseEvent | TouchEvent);
      }
    }

    if (this._tooltipInstance) {
      if (this.positionAtOrigin() && this._lastPositionAtOrigin && this._overlayRef && !isVisible) {
        const strategy = this._overlayRef.getConfig().positionStrategy as any;
        strategy.setOrigin(this._lastPositionAtOrigin);
        this._overlayRef.updatePosition();
      }

      this._tooltipInstance.show(delay);
      return;
    }

    const overlayRef = this._createOverlay();
    this._portal = this._portal || new ComponentPortal(TooltipContent, this._viewContainerRef);
    this._tooltipInstance = overlayRef.attach(this._portal).instance;
    this._tooltipInstance.message = this.message();
    this._tooltipInstance.tooltipClass = this.tooltipClass();
    this._tooltipInstance
      .afterHidden()
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this._detach());

    this._tooltipInstance
      .mouseEntered()
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => {
        this._isContentHovered = true;

        if (this._hideTimeoutId) {
          if (isPlatformBrowser(this._platformId)) {
            window.clearTimeout(this._hideTimeoutId);
          } else {
            clearTimeout(this._hideTimeoutId);
          }
          this._hideTimeoutId = null;
        }
      });

    this._tooltipInstance
      .mouseLeft()
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => {
        this._isContentHovered = false;
        this.hide();
      });

    this._tooltipInstance.show(delay);
  }

  hide(delay: number = this.hideDelay()): void {
    if (this._isContentHovered) {
      return;
    }

    if (this._hideTimeoutId) {
      if (isPlatformBrowser(this._platformId)) {
        window.clearTimeout(this._hideTimeoutId);
      } else {
        clearTimeout(this._hideTimeoutId);
      }
    }

    const handler = () => {
      this._hideTimeoutId = null;

      if (this._isContentHovered) {
        return;
      }

      if (this._tooltipInstance) {
        this._tooltipInstance.hide(delay);
      }
    };

    if (isPlatformBrowser(this._platformId)) {
      this._hideTimeoutId = window.setTimeout(handler, 100) as any;
    } else {
      this._hideTimeoutId = setTimeout(handler, 100) as any;
    }
  }

  hideImmediately(): void {
    this._isContentHovered = false;

    if (this._hideTimeoutId) {
      if (isPlatformBrowser(this._platformId)) {
        window.clearTimeout(this._hideTimeoutId);
      } else {
        clearTimeout(this._hideTimeoutId);
      }
      this._hideTimeoutId = null;
    }

    if (this._tooltipInstance) {
      this._tooltipInstance.hideImmediately();
    }

    this._detach();
  }

  toggle(event?: MouseEvent | TouchEvent): void {
    this._tooltipInstance && this._tooltipInstance.isVisible() ? this.hide() : this.show(event);
  }

  _handleMousedown(event: MouseEvent) {
    if (this.positionAtOrigin()) {
      this._lastPositionAtOrigin = this._getOrigin(event);
    }
  }

  _handleTouchstart(event: TouchEvent) {
    if (this.positionAtOrigin()) {
      this._lastPositionAtOrigin = this._getOrigin(event);
    }
  }

  private _getOrigin(event: MouseEvent | TouchEvent): { x: number, y: number } {
    if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    }

    const touch = event.touches[0];
    return { x: touch.clientX, y: touch.clientY };
  }

  private _createOverlay(): OverlayRef {
    if (this._overlayRef) {
      if (this.positionAtOrigin() && this._lastPositionAtOrigin) {
        const strategy = this._overlayRef.getConfig().positionStrategy as any;
        strategy.setOrigin(this._lastPositionAtOrigin);
        this._overlayRef.updatePosition();
      } else if (!this.positionAtOrigin()) {
        const strategy = this._overlayRef.getConfig().positionStrategy as any;
        strategy.setOrigin(this._elementRef);
        this._overlayRef.updatePosition();
      }
      return this._overlayRef;
    }

    const scrollStrategy = this._overlay.scrollStrategies.reposition();
    let strategy = this._overlay
      .position()
      .flexibleConnectedTo(this.positionAtOrigin() && this._lastPositionAtOrigin ? this._lastPositionAtOrigin : this._elementRef)
      .withTransformOriginOn('.ngs-tooltip')
      .withFlexibleDimensions(false);

    this._overlayRef = this._overlay.create(
      new OverlayConfig({
        direction: this._dir,
        positionStrategy: strategy,
        scrollStrategy,
        panelClass: 'ngs-tooltip-panel',
      })
    );

    this._updatePosition();

    this._overlayRef
      .detachments()
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this._detach());

    return this._overlayRef;
  }

  private _detach() {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
    }
    this._tooltipInstance = null;
    this._lastPositionAtOrigin = null;
  }

  private _updatePosition() {
    const strategy = this._overlayRef!.getConfig().positionStrategy as any;
    const positions = this._getPositions();
    strategy.withPositions(positions);
  }

  private _getPositions(): ConnectedPosition[] {
    const position = this.position();
    const offset = this.offset();

    if (position === 'above') {
      return [
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -offset,
        },
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetY: offset,
        },
      ];
    } else if (position === 'below') {
      return [
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetY: offset,
        },
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -offset,
        },
      ];
    } else if (position === 'left' || position === 'before') {
      return [
        {
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
          offsetX: -offset,
        },
        {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          offsetX: offset,
        },
      ];
    } else if (position === 'right' || position === 'after') {
      return [
        {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          offsetX: offset,
        },
        {
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
          offsetX: -offset,
        },
      ];
    }

    return [
      {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: offset,
      },
    ];
  }
}
