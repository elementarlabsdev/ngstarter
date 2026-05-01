import { Component, inject } from '@angular/core';
import {
  DialogActions,
  DialogClose,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter/components/dialog';
import { Input } from '@ngstarter/components/input';
import { Button } from '@ngstarter/components/button';
import { FormField, Label } from '@ngstarter/components/form-field';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SlideToggle } from '@ngstarter/components/slide-toggle';

@Component({
  selector: 'ngs-add-link',
  imports: [
    DialogContent,
    FormField,
    Input,
    DialogTitle,
    DialogActions,
    Button,
    DialogClose,
    ReactiveFormsModule,
    Label,
    SlideToggle
  ],
  templateUrl: './add-link.dialog.html',
  styleUrl: './add-link.dialog.css'
})
export class AddLinkDialog {
  private _dialogRef = inject(DialogRef);
  private _formBuilder = inject(FormBuilder);

  form = this._formBuilder.group({
    href: [''],
    openInNewTab: [true, [Validators.required]]
  });

  cancel() {
    this._dialogRef.close(false);
  }

  add() {
    this._dialogRef.close(this.form.value);
  }
}
