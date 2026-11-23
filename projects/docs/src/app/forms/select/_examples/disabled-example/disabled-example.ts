import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { Option, Select } from '@ngstarter-ui/components/select';
import { Label } from '@ngstarter-ui/components/form-field';
import { FormField } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-disabled-example',
  imports: [
    Checkbox,
    SignalFormField,
    Option,
    Select,
    Label,
    FormField
  ],
  templateUrl: './disabled-example.html',
  styleUrl: './disabled-example.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    ngSkipHydration: 'true'
  }
})
export class DisabledExample {
  disableSelect = form(signal(false));
}
