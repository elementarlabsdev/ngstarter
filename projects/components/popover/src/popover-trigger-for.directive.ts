import {
  booleanAttribute,
  DestroyRef,
  Directive, ElementRef, EventEmitter,
  inject, Injector, input,
  numberAttribute, OnDestroy, OnInit, output, TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy, FlexibleConnectedPositionStrategyOrigin,
  Overlay,
  OverlayConfig,
  OverlayRef
} from '@angular/cdk/overlay';
import { fromEvent, takeUntil } from 'rxjs';
import { Directionality } from '@angular/cdk/bidi';
import { TemplatePortal } from '@angular/cdk/portal';
import { _getEventTarget } from '@angular/cdk/platform';
import { PopoverTrigger, PopoverPosition, POPOVER_TRIGGER, PopoverTriggerFor } from './types';
import { Popover } from './popover/popover';
import { PositionManager } from '@ngstarter/components/overlay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[ngsPopoverTriggerFor]',
  exportAs: 'ngsPopoverTriggerFor',
  host: {
    'class': 'ngs-popover-trigger-for',
    '[class.ngs-popover-trigger-for--is-open]': 'api.isOpen()',
    '(click)': '_handleClick()',
    '(mouseenter)': '_handleMouseover()',
    '(mouseleave)': '_handleMouseout()'
  }
})
export class PopoverTriggerForDirective implements OnInit, OnDestroy, PopoverTriggerFor {
  private _overlay = inject(Overlay);
  private _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private _directionality = inject(Directionality, { optional: true });
  private _viewContainerRef = inject(ViewContainerRef);
  private _injector = inject(Injector);
  private _popoverPortal!: TemplatePortal;
  private _overlayRef: OverlayRef | null = null;
  private _destroyRef = inject(DestroyRef);
  private _openTimeout: any = null;
  private _closeTimeout: any = null;
  private _closeDelay = 500;

  popover = input.required<Popover | TemplateRef<any>>({
    alias: 'ngsPopoverTriggerFor'
  });
  popoverContext = input<any>(undefined, {
    alias: 'ngsPopoverContext'
  });
  trigger = input<PopoverTrigger>('click');
  position = input<PopoverPosition>('below-center');
  delay = input(500, {
    transform: numberAttribute
  });
  origin = input<FlexibleConnectedPositionStrategyOrigin>();
  closeOnOriginClick = input(false, {
    transform: booleanAttribute
  });
  closeOnOriginMouseLeave = input(false, {
    transform: booleanAttribute
  });
  hasBackdrop = input(false, {
    transform: booleanAttribute
  });

  readonly opened = output<void>();
  readonly closed = output<void>();

  private _closed = new EventEmitter<void>();

  constructor() {
    this._setType();
  }

  protected _handleClick() {
    if (this.trigger() !== 'click') {
      if (this.closeOnOriginClick()) {
        this.close();
      }

      return;
    }

    !this.isOpen() ? this.open() : this.close();
  }

  protected _handleMouseover() {
    if (!this.isOpen() && this.trigger() === 'hover') {
      this._openTimeout = setTimeout(() => {
        this.open();
      }, this.delay());
    }
  }

  protected _handleMouseout() {
    if (!this.isOpen()) {
      clearTimeout(this._openTimeout);
    } else {
      if (this.closeOnOriginMouseLeave()) {
        this.close();
        return;
      }
    }
  }

  ngOnInit() {
    this.closed
      .subscribe(() => {
        this._closed.emit();
      });
  }

  ngOnDestroy() {
    this.close();
    this._destroyOverlay();
  }

  get api(): PopoverTriggerFor {
    return this;
  }

  isOpen() {
    return !!this._overlayRef?.hasAttached();
  }

  open() {
    if (!this.isOpen() && this.popover() != null) {
      this.opened.emit();

      const popover = this.popover();

      if (popover instanceof Popover) {
        popover._setContext(this.popoverContext());
      }

      this._overlayRef = this._overlay.create(this._getOverlayConfig());

      const strategy = this._overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
      strategy.positionChanges
        .pipe(
          takeUntil(this._closed),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe(change => {
          const panelClass = change.connectionPair.panelClass;
          if (panelClass && popover instanceof Popover) {
            popover._setPositionClasses(Array.isArray(panelClass) ? panelClass : [panelClass]);
          }
        });

      this._overlayRef.attach(this._getPopoverContentPortal());
      this._subscribeToHostMouseleave();
      this._subscribeToOutsideClicks();
    }
  }

  close() {
    clearTimeout(this._closeTimeout);
    clearTimeout(this._openTimeout);
    this.closed.emit();
    this._overlayRef!?.detach();
  }

  private _destroyOverlay() {
    clearTimeout(this._openTimeout);
    clearTimeout(this._closeTimeout);
    this._overlayRef?.dispose();
    this._overlayRef = null;
  }

  private _subscribeToOutsideClicks() {
    if (this._overlayRef) {
      this._overlayRef
        .outsidePointerEvents()
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(event => {
          const target = _getEventTarget(event) as Element;
          const element = this._elementRef.nativeElement;

          if (this.closeOnOriginClick() && ((target === element) || element.contains(target))) {
            this.close();
            return;
          }

          if (target !== element && !element.contains(target)) {
            this.close();
          }
        });
    }
  }

  private _getPopoverContentPortal() {
    const injector = Injector.create({
      providers: [
        {
          provide: POPOVER_TRIGGER,
          useValue: this
        }
      ],
      parent: this._injector
    });

    const popover = this.popover();
    const templateRef = popover instanceof Popover ? popover.templateRef() : popover;
    const context = popover instanceof Popover ? null : this.popoverContext();

    this._popoverPortal = new TemplatePortal(
      templateRef,
      this._viewContainerRef,
      context,
      injector
    );
    return this._popoverPortal;
  }

  private _getOverlayConfig() {
    return new OverlayConfig({
      hasBackdrop: this.hasBackdrop(),
      backdropClass: 'ngs-popover-overlay-backdrop',
      positionStrategy: this._getOverlayPositionStrategy(),
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      direction: this._directionality || undefined,
    });
  }

  private _getOverlayPositionStrategy(): FlexibleConnectedPositionStrategy {
    const origin = (this.origin() ? this.origin() : this._elementRef) as FlexibleConnectedPositionStrategyOrigin;
    return this._overlay
      .position()
      .flexibleConnectedTo(origin)
      .setOrigin(origin)
      .withGrowAfterOpen()
      .withPositions(this._getOverlayPositions());
  }

  private _getOverlayPositions(): ConnectedPosition[] {
    return (new PositionManager()).build(this.position());
  }

  private _setType() {
    if (this.trigger() === 'hover') {
      return;
    }

    const element = this._elementRef.nativeElement;

    if (element.nodeName === 'BUTTON' && !element.getAttribute('type')) {
      // Prevents form submissions.
      element.setAttribute('type', 'button');
    }
  }

  private _subscribeToHostMouseleave() {
    if (this.trigger() === 'hover' && this._overlayRef) {
      fromEvent(this._elementRef.nativeElement, 'mouseleave')
        .pipe(
          takeUntil(this._closed),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe(event => {
          if (this.closeOnOriginMouseLeave()) {
            this.close();
            return;
          }

          this._closeTimeout = setTimeout(() => {
            this.close();
          }, this._closeDelay);
        })
      ;
      const popoverElement = this._overlayRef.overlayElement;
      fromEvent(popoverElement, 'mouseenter')
        .pipe(
          takeUntil(this._closed),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe(event => {
          clearTimeout(this._closeTimeout);
          this._closeTimeout = null;
        })
      ;
      fromEvent(popoverElement, 'mouseleave')
        .pipe(
          takeUntil(this._closed),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe(event => {
          this._closeTimeout = setTimeout(() => {
            this.close();
          }, this._closeDelay);
        })
      ;
    }
  }
}
