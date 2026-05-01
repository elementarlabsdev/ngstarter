import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter/components/dialog';
import { Input } from '@ngstarter/components/input';
import { Button } from '@ngstarter/components/button';
import { FormField, Label } from '@ngstarter/components/form-field';

@Component({
  selector: 'ngs-youtube',
  imports: [
    FormsModule,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    Label,
    ReactiveFormsModule
  ],
  templateUrl: './youtube.dialog.html',
  styleUrl: './youtube.dialog.scss'
})
export class YoutubeDialog {
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
