import { Component, inject, signal } from '@angular/core';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import { DialogActions, DialogClose, DialogContent, DialogTitle } from '@ngstarter/components/dialog';

@Component({
  selector: 'ngs-confirm',
  exportAs: 'ngsConfirm',
  imports: [
    ReactiveFormsModule,
    Button,
    DialogClose,
    DialogActions,
    DialogContent,
    DialogTitle
  ],
  templateUrl: './confirm.html',
  styleUrl: './confirm.scss',
  host: {
    'class': 'ngs-confirm'
  }
})
export class Confirm {
  private _data = inject(DIALOG_DATA);

  title = signal(this._data.title);
  description = signal(this._data.description);
}
