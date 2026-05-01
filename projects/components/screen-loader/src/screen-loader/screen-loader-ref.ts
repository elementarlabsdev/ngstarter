import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';

export class ScreenLoaderRef {
  private readonly _afterOpened = new Subject<void>();
  private readonly _afterClosed = new Subject<void>();

  constructor(private overlayRef: OverlayRef) {
    this.overlayRef.detachments().subscribe(() => {
      this._afterClosed.next();
      this._afterClosed.complete();
    });
  }

  close(): void {
    this.overlayRef.dispose();
  }

  afterOpened(): Observable<void> {
    return this._afterOpened.asObservable();
  }

  afterClosed(): Observable<void> {
    return this._afterClosed.asObservable();
  }

  _notifyOpened() {
    this._afterOpened.next();
    this._afterOpened.complete();
  }
}
