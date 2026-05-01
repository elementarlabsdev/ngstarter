import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import {
  DIALOG_DATA,
  DialogActions, DialogClose,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter/components/dialog';
import { Input } from '@ngstarter/components/input';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { FormField, Hint, Label } from '@ngstarter/components/form-field';

@Component({
  selector: 'ngs-edit-link',
  imports: [
    FormsModule,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    Label,
    SlideToggle,
    ReactiveFormsModule,
    DialogClose,
    Hint
  ],
  templateUrl: './edit-link.dialog.html',
  styleUrl: './edit-link.dialog.css'
})
export class EditLinkDialog {
  private _dialogRef = inject(DialogRef);
  private _dialogData = inject(DIALOG_DATA);
  private _formBuilder = inject(FormBuilder);

  form = this._formBuilder.group({
    href: [this._dialogData.href],
    openInNewTab: [this._dialogData.openInNewTab, [Validators.required]]
  });

  cancel() {
    this._dialogRef.close(false);
  }

  add() {
    this._dialogRef.close(this.form.value);
  }
}
