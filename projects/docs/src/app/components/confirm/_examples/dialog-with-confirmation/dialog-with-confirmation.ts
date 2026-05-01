import { Component, inject } from '@angular/core';
import { ConfirmManager } from '@ngstarter/components/confirm';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Button } from '@ngstarter/components/button';
import { DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter/components/dialog';

@Component({
  selector: 'app-dialog-with-confirmation',
  imports: [
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
  ],
  templateUrl: './dialog-with-confirmation.html',
  styleUrl: './dialog-with-confirmation.scss'
})
export class DialogWithConfirmation {
  private snackBar = inject(SnackBar);
  private confirmManager = inject(ConfirmManager);
  private dialogRef = inject(DialogRef);

  onNoClick(): void {
    this.dialogRef.close();
  }

  open() {
    const confirmDef = this.confirmManager.open({
      title: 'Confirm unpublish',
      description: 'You are about to unpublish all Posts in the selection. Are you sure?'
    });
    confirmDef.canceled.subscribe(() => {
      this.snackBar.open('Cancelled!', 'OK');
    });
    confirmDef.confirmed.subscribe(() => {
      this.snackBar.open('Confirmed!', 'OK');
    });
  }
}
