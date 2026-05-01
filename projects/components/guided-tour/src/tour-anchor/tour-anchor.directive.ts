import {
  Directive,
  ElementRef,
  input,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  inject,
  Type,
  ComponentRef
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TourService } from '../tour.service';
import { TourStepConfig, TOUR_STEP_COMPONENT, TOUR_CONFIG, TourStepPosition } from '../tour.types';
import { TourStep } from '../tour-step/tour-step';
import { TourBackdrop } from '../tour-backdrop/tour-backdrop';
import { PositionManager, OverlayPosition } from '@ngstarter-ui/components/overlay';
import { ConnectedPosition, FlexibleConnectedPositionStrategy, ConnectedOverlayPositionChange } from '@angular/cdk/overlay';

@Directive({
  selector: '[ngsTourAnchor]',
  standalone: true
})
export class TourAnchorDirective implements OnInit, OnDestroy {
  anchorId = input.required<string>({ alias: 'ngsTourAnchor' });

  private readonly elementRef = inject(ElementRef);
  private readonly tourService = inject(TourService);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly customStepComponent = inject(TOUR_STEP_COMPONENT, { optional: true });
  private readonly config = inject(TOUR_CONFIG, { optional: true });

  private overlayRef: OverlayRef | null = null;
  private componentRef: ComponentRef<any> | null = null;

  ngOnInit(): void {
    this.tourService.registerAnchor(this.anchorId(), this);
  }

  ngOnDestroy(): void {
    this.tourService.unregisterAnchor(this.anchorId());
    this.hideStep();
  }

  showStep(step: TourStepConfig): void {
    const currentOverlayRef = this.overlayRef;
    const currentComponentRef = this.componentRef;

    if (this.overlayRef === currentOverlayRef) {
      this.overlayRef = null;
      this.componentRef = null;
    }

    if (currentOverlayRef) {
      currentOverlayRef.dispose();
    }

    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const isVisible = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );

    if (!isVisible) {
      this.elementRef.nativeElement.scrollIntoView({
        behavior: 'instant' as any,
        block: 'center',
        inline: 'nearest'
      });
    }

    const timeout = 0;

    // Give time for scroll to finish before calculating coordinates for the backdrop
    setTimeout(() => {
      if (this.tourService.state() === 0) { // TourState.OFF
        return;
      }
      const rect = this.elementRef.nativeElement.getBoundingClientRect();
      const style = window.getComputedStyle(this.elementRef.nativeElement);
      const padding = step.padding ?? this.config?.padding ?? 4;

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

      const positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPush(false)
        .withPositions(preferredPositions);

      this.overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.block(),
        hasBackdrop: false,
        panelClass: 'ngs-tour-step-overlay'
      });

      if (step.withBackdrop) {
        this.tourService.showBackdrop(rect, style.borderRadius, this.viewContainerRef, this.elementRef.nativeElement, padding, step.disableInteraction);
      }

      const componentType = (this.customStepComponent as Type<any>) || TourStep;
      const portal = new ComponentPortal(componentType, this.viewContainerRef);
      this.componentRef = this.overlayRef.attach(portal);

      const safeSetInput = (name: string, value: any) => {
        try {
          this.componentRef?.setInput(name, value);
        } catch (e) {
          // Ignore if input is not declared
        }
      };

      if (positionStrategy instanceof FlexibleConnectedPositionStrategy) {
        positionStrategy.positionChanges.subscribe((change: ConnectedOverlayPositionChange) => {
          safeSetInput('position', change.connectionPair);
        });

        // Trigger position calculation to emit initial value
        this.overlayRef.updatePosition();
      }

      const steps = this.tourService.steps();
      const index = this.tourService.currentStepIndex();
      const isFirst = index === 0;
      const isLast = index === steps.length - 1;

      safeSetInput('step', step);
      safeSetInput('isFirst', isFirst);
      safeSetInput('isLast', isLast);
    }, timeout);
  }

  async hideStep(): Promise<void> {
    const overlayRef = this.overlayRef;
    const componentRef = this.componentRef;

    if (this.overlayRef === overlayRef) {
      this.overlayRef = null;
      this.componentRef = null;
    }

    if (overlayRef) {
      const safeSetInput = (name: string, value: any) => {
        try {
          componentRef?.setInput(name, value);
        } catch (e) {
          // Ignore if input is not declared
        }
      };

      safeSetInput('animateEnterClass', false);
      safeSetInput('animateLeaveClass', true);

      await new Promise(resolve => setTimeout(resolve, 200));
      overlayRef.dispose();
    }
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
}
