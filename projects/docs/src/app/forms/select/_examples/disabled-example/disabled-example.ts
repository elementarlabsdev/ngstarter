import { Component } from '@angular/core';
import { Checkbox } from '@ngstarter/components/checkbox';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Option, Select } from '@ngstarter/components/select';
import { Label } from '@ngstarter/components/form-field';
import { FormField } from '@ngstarter/components/form-field';

@Component({
  selector: 'app-disabled-example',
  imports: [
    Checkbox,
    ReactiveFormsModule,
    Option,
    Select,
    Label,
    FormField
  ],
  templateUrl: './disabled-example.html',
  styleUrl: './disabled-example.scss',
  host: {
    ngSkipHydration: 'true'
  }
})
export class DisabledExample {
  disableSelect = new FormControl(false);
}
