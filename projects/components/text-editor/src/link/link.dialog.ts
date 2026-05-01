import { Component, inject } from '@angular/core';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter-ui/components/dialog';
import { Input } from '@ngstarter-ui/components/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'ngs-link',
  exportAs: 'ngsLink',
  imports: [
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './link.dialog.html',
  styleUrl: './link.dialog.scss'
})
export class LinkDialog {
  private _dialogRef = inject(DialogRef);
  private _data = inject(DIALOG_DATA);
  linkUrl = this._data.linkUrl || '';
  isUpdate = !!this._data.linkUrl;

  onSubmit(): void {
    this._dialogRef.close(this.linkUrl);
  }

  _onNoClick(): void {
    this._dialogRef.close();
  }
}
