import { Injectable, signal, computed, inject, ViewContainerRef, ComponentRef, Type, OnDestroy } from '@angular/core';
import { TourStepConfig, TourState, TOUR_STEP_COMPONENT, TOUR_CONFIG, TourStepPosition } from './tour.types';
import { Subject } from 'rxjs';
import { Overlay, OverlayRef, ConnectedPosition, PositionStrategy, FlexibleConnectedPositionStrategy, ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { PositionManager, OverlayPosition } from '@ngstarter/components/overlay';
import { TourBackdrop } from './tour-backdrop/tour-backdrop';
import { TourStep } from './tour-step/tour-step';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TourService implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly config = inject(TOUR_CONFIG, { optional: true });
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private backdropOverlayRef: OverlayRef | null = null;
  private backdropComponentRef: ComponentRef<TourBackdrop> | null = null;

  private readonly _steps = signal<TourStepConfig[]>([]);
  private readonly _currentStepIndex = signal<number>(-1);
  private readonly _state = signal<TourState>(TourState.OFF);
  private readonly _anchors = new Map<string, any>();
  private stepOverlayRef: OverlayRef | null = null;
  private stepComponentRef: ComponentRef<any> | null = null;
  private readonly customStepComponent = inject(TOUR_STEP_COMPONENT, { optional: true });

  constructor() {
    this.document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('keydown', this.handleKeyDown);
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (this.state() !== TourState.ON || this.config?.keyboardNavigation === false) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
        void this.next();
        break;
      case 'ArrowLeft':
        void this.prev();
        break;
      case 'Escape':
        void this.end();
        break;
    }
  };

  readonly steps = this._steps.asReadonly();
  readonly currentStepIndex = this._currentStepIndex.asReadonly();
  readonly state = this._state.asReadonly();

  readonly currentStep = computed(() => {
    const index = this._currentStepIndex();
    const steps = this._steps();
    return index >= 0 && index < steps.length ? steps[index] : null;
  });

  readonly stepShow$ = new Subject<TourStepConfig>();
  readonly stepHide$ = new Subject<TourStepConfig>();
  readonly start$ = new Subject<void>();
  readonly end$ = new Subject<void>();

  registerAnchor(id: string, anchor: any): void {
    this._anchors.set(id, anchor);
  }

  unregisterAnchor(id: string): void {
    this._anchors.delete(id);
  }

  start(steps: TourStepConfig[]): void {
    this._steps.set(steps);
    this._state.set(TourState.ON);
    this.start$.next();
    void this.goToStep(0);
  }

  async end(): Promise<void> {
    const currentStep = this.currentStep();
    if (currentStep) {
      if (currentStep.onHide) {
        await currentStep.onHide();
      }
      this.stepHide$.next(currentStep);
      // Start hiding step and backdrop in parallel
      const hideStepPromise = this._hideStep(currentStep);
      const hideBackdropPromise = this.hideBackdrop(true);

      await Promise.all([hideStepPromise, hideBackdropPromise]);
    } else {
      await this.hideBackdrop(true);
    }

    this._state.set(TourState.OFF);
    this._currentStepIndex.set(-1);
    this._steps.set([]);
    this.end$.next();
  }

  async next(): Promise<void> {
    const currentStep = this.currentStep();
    if (currentStep?.onNext) {
      await currentStep.onNext();
    }

    if (this._currentStepIndex() < this._steps().length - 1) {
      await this.goToStep(this._currentStepIndex() + 1);
    } else {
      await this.end();
    }
  }

  async prev(): Promise<void> {
    const currentStep = this.currentStep();
    if (currentStep?.onPrev) {
      await currentStep.onPrev();
    }

    if (this._currentStepIndex() > 0) {
      await this.goToStep(this._currentStepIndex() - 1);
    }
  }

  async goToStep(index: number): Promise<void> {
    const currentStep = this.currentStep();
    const nextStep = this._steps()[index];

    if (currentStep) {
      if (currentStep.onHide) {
        await currentStep.onHide();
      }
      this.stepHide$.next(currentStep);
      await this._hideStep(currentStep);
    }

    if (currentStep?.withBackdrop && !nextStep?.withBackdrop) {
      this.hideBackdrop(false);
    }

    if (nextStep?.route) {
      const currentUrl = this.router.url;
      const targetUrl = nextStep.route;

      // Compare only path without params and fragment if needed,
      // but usually Router.url returns full path.
      // If URL differs, perform transition.
      if (currentUrl !== targetUrl) {
        await this.router.navigateByUrl(targetUrl);
      }
    }

    if (nextStep?.onShow) {
      await nextStep.onShow();
    }

    if (nextStep?.waitFor) {
      try {
        await this.waitForElement(nextStep.waitFor);
      } catch (e) {
        console.warn(`TourService: Element "${nextStep.waitFor}" not found after timeout.`);
      }
    }

    this._currentStepIndex.set(index);
    if (nextStep) {
      this.stepShow$.next(nextStep);
      this._showStep(nextStep);
    }
  }

  private waitForElement(selector: string, timeout = 3000): Promise<Element> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        return resolve(element);
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          clearTimeout(timer);
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      const timer = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for element: ${selector}`));
      }, timeout);
    });
  }

  showBackdrop(rect: DOMRect, borderRadius: string, viewContainerRef?: ViewContainerRef, anchorElement?: HTMLElement, padding = 0, disableInteraction = false): void {
    if (!this.backdropOverlayRef) {
      this.backdropOverlayRef = this.overlay.create({
        positionStrategy: this.overlay.position().global(),
        scrollStrategy: this.overlay.scrollStrategies.block(),
        hasBackdrop: false
      });
      const portal = new ComponentPortal(TourBackdrop, viewContainerRef);
      this.backdropComponentRef = this.backdropOverlayRef.attach(portal);

      this.backdropComponentRef.instance.backdropClick.subscribe(() => {
        const step = this.currentStep();
        const closeOnBackdropClick = step?.closeOnBackdropClick ?? this.config?.closeOnBackdropClick ?? false;
        if (closeOnBackdropClick) {
          this.end();
        }
      });
    }
    this.backdropComponentRef?.instance.updatePosition(rect, borderRadius, anchorElement, padding, disableInteraction);
  }

  async hideBackdrop(animate: boolean): Promise<void> {
    const overlayRef = this.backdropOverlayRef;
    const componentRef = this.backdropComponentRef;

    if (!overlayRef) {
      return;
    }

    if (this.backdropOverlayRef === overlayRef) {
      this.backdropOverlayRef = null;
      this.backdropComponentRef = null;
    }

    if (animate) {
      if (componentRef) {
        const safeSetInput = (name: string, value: any) => {
          try {
            componentRef.setInput(name, value);
          } catch (e) {
            // Ignore if input is not declared
          }
        };
        safeSetInput('animateEnterClass', false);
        safeSetInput('animateLeaveClass', true);
      }
      return new Promise(resolve => {
        setTimeout(() => {
          overlayRef.dispose();
          resolve();
        }, 150);
      });
    } else {
      overlayRef.dispose();
      return Promise.resolve();
    }
  }

  private _showStep(step: TourStepConfig): void {
    const anchorId = typeof step.anchorId === 'function' ? step.anchorId() : step.anchorId;
    let anchorElement: HTMLElement | null = null;
    let anchorDirective: any = null;

    if (typeof anchorId === 'string') {
      anchorDirective = this._anchors.get(anchorId);
      if (anchorDirective) {
        anchorDirective.showStep(step);
        return;
      }
      anchorElement = document.querySelector(anchorId) as HTMLElement;

      if (!anchorElement) {
        anchorElement = document.getElementById(anchorId);
      }
    } else if (anchorId instanceof HTMLElement) {
      anchorElement = anchorId;
    }

    if (anchorElement) {
      this.showStepForElement(anchorElement, step);
    }
  }

  private showStepForElement(element: HTMLElement, step: TourStepConfig): void {
    if (this.stepOverlayRef) {
      const oldOverlayRef = this.stepOverlayRef;
      const oldComponentRef = this.stepComponentRef;
      this.stepOverlayRef = null;
      this.stepComponentRef = null;
      oldOverlayRef.dispose();
    }

    const rect = element.getBoundingClientRect();
    const isVisible = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );

    if (!isVisible) {
      element.scrollIntoView({
        behavior: 'instant' as any,
        block: 'center',
        inline: 'nearest'
      });
    }

    setTimeout(() => {
      if (this.state() === TourState.OFF) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const padding = step.padding ?? this.config?.padding ?? 4;

      let positionStrategy: PositionStrategy;
      const positionManager = new PositionManager();
      const defaultPositions: ConnectedPosition[] = [
        ...positionManager.build('below-center'),
        ...positionManager.build('above-center'),
        ...positionManager.build('after-center'),
        ...positionManager.build('before-center'),
      ].map(p => ({ ...p, ...this._getOffset(p, padding) }));

      const preferredPositions = step.position
        ? positionManager.build(step.position as any as OverlayPosition).map(p => ({ ...p, ...this._getOffset(p, padding) }))
        : defaultPositions;

      positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(element)
        .withPush(false)
        .withPositions(preferredPositions);

      this.stepOverlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.block(),
        hasBackdrop: false,
        panelClass: 'ngs-tour-step-overlay'
      });

      if (step.withBackdrop) {
        this.showBackdrop(rect, style.borderRadius, undefined, element, padding, step.disableInteraction);
      }

      const componentType = (this.customStepComponent as Type<any>) || TourStep;
      const portal = new ComponentPortal(componentType);

      this.stepComponentRef = this.stepOverlayRef.attach(portal);

      const safeSetInput = (name: string, value: any) => {
        try {
          this.stepComponentRef?.setInput(name, value);
        } catch (e) {
          // Ignore if input is not declared
        }
      };

      if (positionStrategy instanceof FlexibleConnectedPositionStrategy) {
        positionStrategy.positionChanges.subscribe((change: ConnectedOverlayPositionChange) => {
          safeSetInput('position', change.connectionPair);
        });
      }

      const steps = this.steps();
      const index = this.currentStepIndex();
      const isFirst = index === 0;
      const isLast = index === steps.length - 1;

      safeSetInput('step', step);
      safeSetInput('isFirst', isFirst);
      safeSetInput('isLast', isLast);

      if (positionStrategy instanceof FlexibleConnectedPositionStrategy) {
        this.stepOverlayRef.updatePosition();
      }

    }, 0);
  }

  private _getOffset(position: ConnectedPosition, padding: number): { offsetX?: number, offsetY?: number } {
    const offset = 8 + padding;
    if (position.originY === 'bottom' && position.overlayY === 'top') {
      return { offsetY: offset };
    }
    if (position.originY === 'top' && position.overlayY === 'bottom') {
      return { offsetY: -offset };
    }
    if (position.originX === 'end' && position.overlayX === 'start') {
      return { offsetX: offset };
    }
    if (position.originX === 'start' && position.overlayX === 'end') {
      return { offsetX: -offset };
    }
    return {};
  }

  private async _hideStep(step: TourStepConfig): Promise<void> {
    const anchorId = typeof step.anchorId === 'function' ? step.anchorId() : step.anchorId;
    if (typeof anchorId === 'string') {
      const anchor = this._anchors.get(anchorId);
      if (anchor) {
        await anchor.hideStep();
        return;
      }
    }

    const overlayRef = this.stepOverlayRef;
    const componentRef = this.stepComponentRef;

    if (overlayRef) {
      if (this.stepOverlayRef === overlayRef) {
        this.stepOverlayRef = null;
        this.stepComponentRef = null;
      }

      const safeSetInput = (name: string, value: any) => {
        try {
          componentRef?.setInput(name, value);
        } catch (e) {
          // Ignore if input is not declared
        }
      };

      safeSetInput('animateEnterClass', false);
      safeSetInput('animateLeaveClass', true);

      await new Promise(resolve => setTimeout(resolve, 150));
      overlayRef.dispose();
    }
  }
}
