import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Option, Select } from '@ngstarter-ui/components/select';

@Component({
  selector: 'app-clearable-select-example',
  imports: [
    SignalFormField,
    FormField,
    Label,
    Option,
    Select
  ],
  templateUrl: './clearable-select-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './clearable-select-example.scss'
})
export class ClearableSelectExample {
  readonly status = form(signal<string | null>('active'));
  readonly statuses = signal([
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' },
  ]);
}
