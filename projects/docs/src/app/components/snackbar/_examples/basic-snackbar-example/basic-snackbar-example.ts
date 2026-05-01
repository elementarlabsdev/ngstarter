import { Component, inject } from '@angular/core';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

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
