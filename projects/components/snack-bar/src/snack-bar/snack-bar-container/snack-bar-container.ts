import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  signal,
  PLATFORM_ID,
  viewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { SnackBarConfig } from '../snack-bar-config';

@Component({
  selector: 'ngs-snack-bar-container',
  exportAs: 'ngsSnackBarContainer',
  templateUrl: './snack-bar-container.html',
  styleUrl: './snack-bar-container.scss',
  standalone: true,
  imports: [CdkPortalOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'snack-bar-container-host'
  }
})
export class SnackBarContainer extends BasePortalOutlet implements OnDestroy {
  readonly _portalOutlet = viewChild.required(CdkPortalOutlet);
  private _cdr = inject(ChangeDetectorRef);
  private _platformId = inject(PLATFORM_ID);

  /** State of the snack bar animation. */
  readonly animationState = signal<'void' | 'visible' | 'hidden-top' | 'hidden-bottom'>('void');
  readonly leaving = signal(false);

  /** Event emitted when the snack bar exit animation is finished. */
  readonly _onExit = new EventEmitter<void>();

  /** Event emitted when the snack bar enter animation is finished. */
  readonly _onEnter = new EventEmitter<void>();

  constructor(public snackBarConfig: SnackBarConfig) {
    super();
    if (this.snackBarConfig.verticalPosition === 'top') {
      this.animationState.set('hidden-top');
    } else {
      this.animationState.set('hidden-bottom');
    }
  }

  /** Attach a component portal as content to this snack bar container. */
  override attachComponentPortal<T>(portal: ComponentPortal<T>): any {
    this._assertNotAttached();
    return this._portalOutlet().attachComponentPortal(portal);
  }

  /** Attach a template portal as content to this snack bar container. */
  override attachTemplatePortal<C>(portal: TemplatePortal<C>): any {
    this._assertNotAttached();
    return this._portalOutlet().attachTemplatePortal(portal);
  }

  /** Begin animation of snack bar entrance into view. */
  enter(): void {
    // Ensure we are not in leaving state
    this.leaving.set(false);

    if (!isPlatformBrowser(this._platformId)) {
      this.animationState.set('visible');
      this._cdr.markForCheck();
      return;
    }

    // Use requestAnimationFrame to ensure the initial state (hidden-top/bottom)
    // is applied to the DOM before we change it to 'visible'.
    // We use two nested requestAnimationFrames to ensure at least one paint cycle has occurred.
    // The first rAF captures the current state, the second one allows for the state to be applied
    // and then triggers the transition.
    requestAnimationFrame(() => {
      // Force a reflow to ensure the initial styles are applied.
      // This is sometimes necessary in addition to rAF in some browsers/environments.
      if (typeof document !== 'undefined' && document.body) {
        void document.body.offsetHeight;
      }
      requestAnimationFrame(() => {
        this.animationState.set('visible');
        this._cdr.markForCheck();
      });
    });
  }

  /** Begin animation of snack bar exit from view. */
  exit(): void {
    const initialState = this.animationState();
    const targetState = this.snackBarConfig.verticalPosition === 'top' ? 'hidden-top' : 'hidden-bottom';

    if (initialState === targetState) {
      this._onExit.emit();
      return;
    }

    // Mark as leaving to use faster transition timing
    this.leaving.set(true);
    this.animationState.set(targetState);
    this._cdr.markForCheck();
  }

  /** Handle end of transition. */
  onTransitionEnd(event: TransitionEvent) {
    if (event.propertyName !== 'transform' && event.propertyName !== 'opacity') {
      return;
    }
    const state = this.animationState();
    if (state === 'visible' && event.propertyName === 'transform') {
      this._onEnter.emit();
    } else if ((state === 'hidden-top' || state === 'hidden-bottom')) {
      if (event.propertyName === 'opacity' || event.propertyName === 'transform') {
        this._onExit.emit();
      }
    }
  }

  /** Asserts that no content is already attached to the container. */
  private _assertNotAttached() {
    if (this._portalOutlet().hasAttached()) {
      throw Error('Attempting to attach snack bar content after content has already been attached.');
    }
  }

  ngOnDestroy() {
    this._onExit.complete();
    this._onEnter.complete();
  }
}
