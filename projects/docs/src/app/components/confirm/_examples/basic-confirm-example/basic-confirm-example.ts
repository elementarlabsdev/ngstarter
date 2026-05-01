import { Component, inject } from '@angular/core';
import { ConfirmManager } from '@ngstarter/components/confirm';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-basic-confirm-example',
  imports: [
    Button
  ],
  templateUrl: './basic-confirm-example.html',
  styleUrl: './basic-confirm-example.scss'
})
export class BasicConfirmExample {
  private _snackBar = inject(SnackBar);
  private _confirmManager = inject(ConfirmManager);

  open() {
    const confirmDef = this._confirmManager.open({
      title: 'Confirm unpublish',
      description: 'You are about to unpublish all Posts in the selection. Are you sure?'
    });
    confirmDef.canceled.subscribe(() => {
      this._snackBar.open('Cancelled!', 'OK');
    });
    confirmDef.confirmed.subscribe(() => {
      this._snackBar.open('Confirmed!', 'OK');
    });
  }
}
