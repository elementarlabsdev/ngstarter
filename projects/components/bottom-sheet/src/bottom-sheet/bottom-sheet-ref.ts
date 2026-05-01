import { DialogRef } from '@angular/cdk/dialog';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { BottomSheetConfig } from './bottom-sheet-config';

/**
 * Reference to a bottom sheet dispatched from the BottomSheet service.
 */
export class BottomSheetRef<T = any, R = any> {
  /** @internal */
  _refInstance: T | null = null;

  /** @internal */
  _refRef: any = null;

  /** Instance of the component making up the content of the bottom sheet. */
  get instance(): T {
    return this._refInstance!;
  }

  /**
   * `ComponentRef` of the component opened into the bottom sheet. Will be
   * null when the bottom sheet is opened using a `TemplateRef`.
   */
  get componentRef() {
    return this._refRef;
  }

  /** Whether the user is allowed to close the bottom sheet. */
  disableClose: boolean | undefined;

  /** Subject for notifying the user that the bottom sheet has opened and appeared. */
  private readonly _afterOpened = new Subject<void>();

  /** Result to be passed down to the `afterDismissed` stream. */
  private _result: R | undefined;

  /** Handle to the timeout that's running as a fallback in case the exit animation doesn't fire. */
  private _closeFallbackTimeout: any;

  constructor(
    private _ref: DialogRef<R, T>,
    config: BottomSheetConfig,
    public containerInstance: any
  ) {
    this.disableClose = config.disableClose;

    // Emit when opening animation completes
    containerInstance._animationStateChanged
      .pipe(
        filter((event: any) => event.phase === 'done' && event.toState === 'visible'),
        take(1)
      )
      .subscribe(() => {
        this._afterOpened.next();
        this._afterOpened.complete();
      });

    // Dispose overlay when closing animation is complete
    containerInstance._animationStateChanged
      .pipe(
        filter((event: any) => event.phase === 'done' && (event.toState === 'hidden' || event.toState === 'void')),
        take(1)
      )
      .subscribe(() => {
        if (this._closeFallbackTimeout) {
          clearTimeout(this._closeFallbackTimeout);
        }
        this._ref.close(this._result);
      });

    _ref.overlayRef.detachments().subscribe(() => {
      this._ref.close(this._result);
    });

    _ref.backdropClick.subscribe(() => {
      if (!this.disableClose) {
        this.dismiss();
      }
    });

    _ref.keydownEvents
      .pipe(filter(event => event.keyCode === ESCAPE))
      .subscribe(event => {
        if (!this.disableClose && !hasModifierKey(event)) {
          event.preventDefault();
          this.dismiss();
        }
      });
  }

  /**
   * Dismisses the bottom sheet.
   * @param result Data to be passed back to the bottom sheet opener.
   */
  dismiss(result?: R): void {
    if (!this.containerInstance) {
      return;
    }

    // Transition the backdrop in parallel to the bottom sheet.
    this._ref.overlayRef.detachBackdrop();

    this._result = result;
    this.containerInstance.exit();
    this._closeFallbackTimeout = setTimeout(() => {
      this._ref.close(this._result);
    }, 400);
  }

  /** Gets an observable that is notified when the bottom sheet is finished closing. */
  afterDismissed() {
    return this._ref.closed;
  }

  /** Gets an observable that is notified when the bottom sheet has opened and appeared. */
  afterOpened() {
    return this._afterOpened;
  }

  /**
   * Gets an observable that emits when the overlay's backdrop has been clicked.
   */
  backdropClick() {
    return this._ref.backdropClick;
  }

  /**
   * Gets an observable that emits when keydown events are targeted on the overlay.
   */
  keydownEvents() {
    return this._ref.keydownEvents;
  }
}
