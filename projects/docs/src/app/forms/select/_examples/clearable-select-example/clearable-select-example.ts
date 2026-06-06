import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Option, Select } from '@ngstarter-ui/components/select';

@Component({
  selector: 'app-clearable-select-example',
  imports: [
    ReactiveFormsModule,
    FormField,
    Label,
    Option,
    Select
  ],
  templateUrl: './clearable-select-example.html',
  styleUrl: './clearable-select-example.scss'
})
export class ClearableSelectExample {
  readonly status = signal(new FormControl<string | null>('active'));
  readonly statuses = signal([
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' },
  ]);
}
