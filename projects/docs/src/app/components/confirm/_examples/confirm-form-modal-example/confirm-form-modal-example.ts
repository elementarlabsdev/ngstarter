import { Component, inject } from '@angular/core';
import { DialogWithConfirmation } from '../dialog-with-confirmation/dialog-with-confirmation';
import { Button } from '@ngstarter/components/button';
import { Dialog } from '@ngstarter/components/dialog';

@Component({
  selector: 'app-confirm-form-modal-example',
  imports: [
    Button
  ],
  templateUrl: './confirm-form-modal-example.html',
  styleUrl: './confirm-form-modal-example.scss'
})
export class ConfirmFormModalExample {
  private _dialog = inject(Dialog);

  open(): void {
    this._dialog.open(DialogWithConfirmation);
  }
}
