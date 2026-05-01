import { Component } from '@angular/core';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Option, Select } from '@ngstarter-ui/components/select';
import { Label } from '@ngstarter-ui/components/form-field';
import { FormField } from '@ngstarter-ui/components/form-field';

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
