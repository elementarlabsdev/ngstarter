import { Component, inject } from '@angular/core';
import { Select, Option } from '@ngstarter-ui/components/select';
import { SnackBar, SnackBarHorizontalPosition, SnackBarVerticalPosition } from '@ngstarter-ui/components/snack-bar';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
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
