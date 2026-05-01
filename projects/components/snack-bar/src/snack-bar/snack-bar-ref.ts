import { Observable, Subject } from 'rxjs';
import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';

export class SnackBarRef<T> {
  /** The instance of the component making up the content of the snack bar. */
  instance!: T;

  /** Subject for notifying the user that the snack bar has been dismissed. */
  private readonly _afterDismissed = new Subject<void>();

  /** Subject for notifying the user that the snack bar has opened and appeared. */
  private readonly _afterOpened = new Subject<void>();

  constructor(public containerInstance: any, private _overlayRef: OverlayRef) {
    containerInstance._onExit.subscribe(() => {
      this._overlayRef.dispose();
      this._afterDismissed.next();
      this._afterDismissed.complete();
    });

    containerInstance._onEnter.subscribe(() => {
      this._afterOpened.next();
      this._afterOpened.complete();
    });
  }

  /** Dismisses the snack bar. */
  dismiss(): void {
    if (!this._afterDismissed.closed) {
      this.containerInstance.exit();
    }
  }

  /** Gets an observable that is notified when the snack bar is finished closing. */
  afterDismissed(): Observable<void> {
    return this._afterDismissed.asObservable();
  }

  /** Gets an observable that is notified when the snack bar has opened and appeared. */
  afterOpened(): Observable<void> {
    return this._afterOpened.asObservable();
  }
}
