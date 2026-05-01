import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnDestroy,
  inject,
  EventEmitter,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { CdkDialogContainer } from '@angular/cdk/dialog';

/**
 * Internal component that wraps user-provided bottom sheet content.
 * @docs-private
 */
@Component({
  selector: 'ngs-bottom-sheet-container',
  template: '<ng-template cdkPortalOutlet />',
  styleUrl: 'bottom-sheet-container.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CdkPortalOutlet],
  host: {
    'class': 'ngs-bottom-sheet-container',
    'tabindex': '-1',
    '[attr.role]': '_config.role',
    '[attr.aria-modal]': '_config.ariaModal',
    '[attr.aria-label]': '_config.ariaLabel',
    '[class.ngs-bottom-sheet-container-visible]': '_animationState === "visible"',
    '[class.ngs-bottom-sheet-container-hidden]': '_animationState === "hidden"',
    '(transitionend)': '_onTransitionEnd($event)',
  },
})
export class BottomSheetContainer extends CdkDialogContainer implements OnDestroy {
  private _breakpointSubscription: Subscription;

  /** The state of the bottom sheet animations. */
  _animationState: 'void' | 'visible' | 'hidden' = 'void';

  /** Emits whenever the state of the animation changes. */
  _animationStateChanged = new EventEmitter<any>();

  /** Whether the component has been destroyed. */
  private _destroyed = false;

  constructor() {
    super();
    const breakpointObserver = inject(BreakpointObserver);
    this._breakpointSubscription = breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(() => {
        const classList = this._elementRef.nativeElement.classList;
        classList.toggle(
          'ngs-bottom-sheet-container-medium',
          breakpointObserver.isMatched(Breakpoints.Medium)
        );
        classList.toggle(
          'ngs-bottom-sheet-container-large',
          breakpointObserver.isMatched(Breakpoints.Large)
        );
        classList.toggle(
          'ngs-bottom-sheet-container-xlarge',
          breakpointObserver.isMatched(Breakpoints.XLarge)
        );
      });
  }

  /** Begin animation of bottom sheet entrance into view. */
  enter() {
    if (!this._destroyed) {
      this._animationState = 'visible';
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Begin animation of the bottom sheet exiting from view. */
  exit() {
    if (!this._destroyed) {
      this._animationState = 'hidden';
      this._changeDetectorRef.markForCheck();
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._breakpointSubscription.unsubscribe();
    this._destroyed = true;
  }

  _onTransitionEnd(event: TransitionEvent) {
    if (event.propertyName === 'transform') {
      this._animationStateChanged.emit({
        fromState: this._animationState === 'visible' ? 'void' : 'visible',
        toState: this._animationState,
        totalTime: 300,
        phaseName: 'done',
      });
    }
  }
}
