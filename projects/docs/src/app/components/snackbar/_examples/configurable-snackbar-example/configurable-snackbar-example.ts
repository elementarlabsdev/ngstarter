import { Component, inject } from '@angular/core';
import { Select, Option } from '@ngstarter/components/select';
import { SnackBar, SnackBarHorizontalPosition, SnackBarVerticalPosition } from '@ngstarter/components/snack-bar';
import { Button } from '@ngstarter/components/button';
import { FormField, Label } from '@ngstarter/components/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configurable-snackbar-example',
  imports: [
    Select,
    Option,
    Button,
    Label,
    FormsModule,
    FormField
  ],
  templateUrl: './configurable-snackbar-example.html',
  styleUrl: './configurable-snackbar-example.scss'
})
export class ConfigurableSnackbarExample {
  private snackBar = inject(SnackBar);

  horizontalPosition: SnackBarHorizontalPosition = 'start';
  verticalPosition: SnackBarVerticalPosition = 'bottom';

  openSnackBar() {
    this.snackBar.open('Cannonball!!', 'Splash', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}
