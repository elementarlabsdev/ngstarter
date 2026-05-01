import { Directive, input, inject } from '@angular/core';
import { DialogRef } from './dialog-ref';
import { Dialog } from './dialog.service';

@Directive({
  selector: '[ngs-dialog-close], [ngsDialogClose]',
  exportAs: 'ngsDialogClose',
  standalone: true,
  host: {
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.type]': 'type()',
    '(click)': '_onClick()',
  }
})
export class DialogClose {
  dialogResult = input<any>(undefined, {
    alias: 'ngs-dialog-close'
  });
  _dialogResult = input<any>(undefined, {
    alias: 'ngsDialogClose'
  });
  ariaLabel = input<string | null>(null);
  type = input<'submit' | 'button' | 'reset'>('button');

  private _dialogRef = inject(DialogRef, { optional: true });
  private _dialog = inject(Dialog);

  protected _onClick() {
    if (this._dialogRef) {
      this._dialog.close(this._dialogRef, this.dialogResult() || this._dialogResult());
    }
  }
}
