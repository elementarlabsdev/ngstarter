import { DestroyRef, inject, Injectable } from '@angular/core';
import { ConfirmOptions } from './types';
import { ConfirmRef } from './confirm-ref';
import { Confirm } from './confirm/confirm';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Dialog } from '@ngstarter/components/dialog';

@Injectable({
  providedIn: 'root'
})
export class ConfirmManager {
  private _dialog = inject(Dialog);
  private _destroyRef = inject(DestroyRef);

  open(options: ConfirmOptions): ConfirmRef {
    const confirmRef = new ConfirmRef();
    const dialogRef = this._dialog.open(Confirm, {
      data: options,
      closeOnNavigation: true,
      disableClose: true
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((isConfirmed: boolean) => {
        if (isConfirmed) {
          confirmRef.confirm();
        } else {
          confirmRef.cancel();
        }
      });
    return confirmRef;
  }
}
