import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { Button } from '@ngstarter-ui/components/button';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogClose,
  DialogTitle
} from '@ngstarter-ui/components/dialog';
import { Input } from '@ngstarter-ui/components/input';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'ngs-edit-link',
  imports: [
    Button,
    DialogActions,
    DialogClose,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    Label,
    SlideToggle,
    SignalFormField,
    Hint
  ],
  templateUrl: './edit-link.dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './edit-link.dialog.css'
})
export class EditLinkDialog {
  private _dialogData = inject(DIALOG_DATA);

  readonly form = form(signal({href: this._dialogData.href ?? '', openInNewTab: this._dialogData.openInNewTab ?? false}));
}
