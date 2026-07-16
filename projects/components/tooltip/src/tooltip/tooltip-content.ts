import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { Subject } from 'rxjs';
import { NgClass, isPlatformBrowser } from '@angular/common';

export type TooltipVisibility = 'initial' | 'visible' | 'hidden';

@Component({
  selector: 'ngs-tooltip-content',
  template: `
    <div class="ngs-tooltip"
         [ngClass]="tooltipClass">
      {{message}}
    </div>
  `,
  styleUrl: './tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass],
  host: {
    'aria-hidden': 'true',
    '(body:click)': 'this._handleBodyClick()',
    '[class.ngs-tooltip-visible]': "_visibility === 'visible'",
    '[class.ngs-tooltip-hidden]': "_visibility === 'hidden'",
    '(transitionend)': '_onTransitionEnd($event)',
    '(mouseenter)': '_handleMouseEnter()',
    '(mouseleave)': '_handleMouseLeave()',
  },
})
export class TooltipContent implements OnDestroy {
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _platformId = inject(PLATFORM_ID);

  /** Message to display in the tooltip */
  message: string = '';

  /** Classes to be added to the tooltip. */
  tooltipClass: any = '';

  /** The timeout ID of any current timer set to show the tooltip */
  _showTimeoutId: number | null = null;

  /** The timeout ID of any current timer set to hide the tooltip */
  _hideTimeoutId: number | null = null;

  /** Property watched by the animation framework to show or hide the tooltip */
  _visibility: TooltipVisibility = 'initial';

  /** Subject for notifying that the tooltip has been hidden from the view */
  private readonly _onHide = new Subject<void>();

  /** Subject for notifying that the mouse has entered the tooltip content */
  private readonly _onMouseEnter = new Subject<void>();

  /** Subject for notifying that the mouse has left the tooltip content */
  private readonly _onMouseLeave = new Subject<void>();

  /** Amount of time (in ms) to wait after a mouseleave event before hiding the tooltip. */
  _mouseLeaveHideDelay: number = 0;

  ngOnDestroy() {
    this._onHide.complete();
    this._onMouseEnter.complete();
    this._onMouseLeave.complete();
    this._cancelPendingAnimations();
  }

  /**
   * Shows the tooltip with an animation delay.
   * @param delay Amount of milliseconds to the delay.
   */
  show(delay: number): void {
    // Cancel any instances where the tooltip might be hiding
    this._cancelPendingAnimations();

    const handler = () => {
      this._visibility = 'visible';
      this._showTimeoutId = null;
      this._changeDetectorRef.markForCheck();
    };

    // Set the visibility of the tooltip after the delay
    if (isPlatformBrowser(this._platformId)) {
      this._showTimeoutId = window.setTimeout(handler, delay) as any;
    } else {
      this._showTimeoutId = setTimeout(handler, delay) as any;
    }
  }

  /**
   * Causes the tooltip to begin in hiding animation.
   * @param delay Amount of milliseconds to the delay.
   */
  hide(delay: number): void {
    // Cancel any instances where the tooltip might be showing
    this._cancelPendingAnimations();

    const handler = () => {
      this._visibility = 'hidden';
      this._hideTimeoutId = null;
      this._changeDetectorRef.markForCheck();
    };

    // Set the visibility of the tooltip after the delay
    if (isPlatformBrowser(this._platformId)) {
      this._hideTimeoutId = window.setTimeout(handler, delay) as any;
    } else {
      this._hideTimeoutId = setTimeout(handler, delay) as any;
    }
  }

  /**
   * Hides the tooltip without entering the animated hidden state.
   */
  hideImmediately(): void {
    this._cancelPendingAnimations();
    this._visibility = 'hidden';
    this._changeDetectorRef.markForCheck();
    this._onHide.next();
  }

  /** Returns an observable that notifies when the tooltip has been hidden from view. */
  afterHidden() {
    return this._onHide.asObservable();
  }

  /** Returns an observable that notifies when the mouse enters the tooltip content. */
  mouseEntered() {
    return this._onMouseEnter.asObservable();
  }

  /** Returns an observable that notifies when the mouse leaves the tooltip content. */
  mouseLeft() {
    return this._onMouseLeave.asObservable();
  }

  /** Whether the tooltip is being displayed. */
  isVisible(): boolean {
    return this._visibility === 'visible';
  }

  _onTransitionEnd(event: TransitionEvent) {
    if (event.propertyName === 'opacity' && this._visibility === 'hidden') {
      this._onHide.next();
    }
  }

  /**
   * Interactions on the HTML body should close the tooltip immediately as a way of closing
   * tooltips when focus moves combined with clicking.
   */
  _handleBodyClick() {
    if (this.isVisible()) {
      this.hideImmediately();
    }
  }

  _handleMouseEnter() {
    this._onMouseEnter.next();
  }

  _handleMouseLeave() {
    this._onMouseLeave.next();
  }

  /**
   * Cancels any pending animation timers.
   */
  private _cancelPendingAnimations() {
    if (this._showTimeoutId) {
      if (isPlatformBrowser(this._platformId)) {
        window.clearTimeout(this._showTimeoutId);
      } else {
        clearTimeout(this._showTimeoutId);
      }
      this._showTimeoutId = null;
    }

    if (this._hideTimeoutId) {
      if (isPlatformBrowser(this._platformId)) {
        window.clearTimeout(this._hideTimeoutId);
      } else {
        clearTimeout(this._hideTimeoutId);
      }
      this._hideTimeoutId = null;
    }
  }
}
