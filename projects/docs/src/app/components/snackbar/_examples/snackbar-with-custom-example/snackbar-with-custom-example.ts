import { Component, inject } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { FormsModule } from '@angular/forms';
import { Input } from '@ngstarter-ui/components/input';
import { SnackbarExample } from '../snackbar-example/snackbar-example';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-snackbar-with-custom-component-example',
  imports: [
    FormField,
    FormsModule,
    Input,
    Label,
    Button
  ],
  templateUrl: './snackbar-with-custom-example.html',
  styleUrl: './snackbar-with-custom-example.scss'
})
export class SnackbarWithCustomExample {
  private snackBar = inject(SnackBar);

  durationInSeconds = 5;

  openSnackBar() {
    this.snackBar.openFromComponent(SnackbarExample, {
      duration: this.durationInSeconds * 1000,
    });
  }
}
