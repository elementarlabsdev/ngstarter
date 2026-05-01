import { Component, inject } from '@angular/core';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Button } from '@ngstarter/components/button';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'app-basic-snackbar-example',
  imports: [
    Button,
    Label,
    Input,
    FormField
  ],
  templateUrl: './basic-snackbar-example.html',
  styleUrl: './basic-snackbar-example.scss'
})
export class BasicSnackbarExample {
  private snackBar = inject(SnackBar);

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action);
  }
}
