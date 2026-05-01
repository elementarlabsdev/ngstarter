import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  RadioCard,
  RadioCardContent,
  RadioCardGroup, RadioCardTitle
} from '@ngstarter/components/radio-card';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-radio-card-example',
  imports: [
    RadioCard,
    RadioCardGroup,
    ReactiveFormsModule,
    Icon,
    RadioCardContent,
    RadioCardTitle,
    Button,
  ],
  templateUrl: './radio-card-example.html',
  styleUrl: './radio-card-example.scss'
})
export class RadioCardExample {
  form = new FormGroup({
    privacy: new FormControl('open'),
  });

  toggleDisabled(): void {
    const control = this.form.get('privacy');
    if (control) {
      control.disabled ? control.enable() : control.disable();
    }
  }
}
