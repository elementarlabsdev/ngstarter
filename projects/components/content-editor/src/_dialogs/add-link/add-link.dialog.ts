import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  DialogActions,
  DialogContent,
  DialogClose,
  DialogTitle
} from '@ngstarter-ui/components/dialog';
import { Input } from '@ngstarter-ui/components/input';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';

@Component({
  selector: 'ngs-add-link',
  imports: [
    DialogContent,
    FormField,
    Input,
    DialogTitle,
    DialogActions,
    DialogClose,
    Button,
    SignalFormField,
    Label,
    SlideToggle
  ],
  templateUrl: './add-link.dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './add-link.dialog.css'
})
export class AddLinkDialog {

  readonly form = form(signal({href: '', openInNewTab: true}));
}
