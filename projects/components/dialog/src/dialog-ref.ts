import { Subject, Observable, filter, take } from 'rxjs';
import { DialogContainer } from './dialog-container/dialog-container';

export class DialogRef<T, R = any> {
  private readonly _afterClosed = new Subject<R | undefined>();
  private readonly _afterOpened = new Subject<void>();
  private readonly _backdropClick = new Subject<MouseEvent>();
  private readonly _keydownEvents = new Subject<KeyboardEvent>();

  componentInstance: T | null = null;
  disableClose: boolean | undefined;

  /** @internal */
  _cdkRef: any;

  /** @internal */
  _container: DialogContainer | undefined;

  private _isClosing = false;

  close(dialogResult?: R): void {
    if (this._isClosing) {
      return;
    }

    this._isClosing = true;

    if (this._container && this._cdkRef) {

      // Start exit animation for the container
      this._container._startExitAnimation();

      // Start exit animation for the backdrop
      const overlayRef = this._cdkRef.overlayRef;
      const backdropElement = overlayRef.backdropElement;
      if (backdropElement) {
        // Remove both classes that could be forcing opacity: 1
        backdropElement.classList.remove('ngs-dialog-backdrop-showing');
        backdropElement.classList.remove('cdk-overlay-backdrop-showing');
      }

      // Wait for the container animation to finish before destroying the overlay
      this._container._animationStateChanged
        .pipe(
          filter((event: any) => event.phaseName === 'done' && event.toState === 'exit'),
          take(1)
        )
        .subscribe(() => {
          this._finishClose(dialogResult);
        });

      // Fallback in case transitionend never fires (e.g. if opacity was already 0 or style didn't apply)
      setTimeout(() => {
        if (this._isClosing && this._cdkRef) {
          this._finishClose(dialogResult);
        }
      }, 250);

      return;
    }
    this._finishClose(dialogResult);
  }

  private _finishClose(dialogResult?: R): void {
    if (this._cdkRef) {
      const cdkRef = this._cdkRef;
      this._cdkRef = null;
      cdkRef.close(dialogResult);
    }
    this._afterClosed.next(dialogResult);
    this._afterClosed.complete();
    this._afterOpened.complete();
    this._backdropClick.complete();
    this._keydownEvents.complete();
  }

  afterClosed(): Observable<R | undefined> {
    return this._afterClosed.asObservable();
  }

  afterOpened(): Observable<void> {
    return this._afterOpened.asObservable();
  }

  backdropClick(): Observable<MouseEvent> {
    return this._backdropClick.asObservable();
  }

  keydownEvents(): Observable<KeyboardEvent> {
    return this._keydownEvents.asObservable();
  }

  __fireAfterOpened(): void {
    this._afterOpened.next();
  }

  __fireBackdropClick(event: MouseEvent): void {
    this._backdropClick.next(event);
  }

  __fireKeydownEvent(event: KeyboardEvent): void {
    this._keydownEvents.next(event);
  }
}
