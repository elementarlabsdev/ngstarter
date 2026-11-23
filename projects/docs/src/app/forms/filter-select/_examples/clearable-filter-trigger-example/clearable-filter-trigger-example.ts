import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { FilterTrigger, Option, Select } from '@ngstarter-ui/components/select';

@Component({
  selector: 'app-clearable-filter-trigger-example',
  imports: [
    SignalFormField,
    FilterTrigger,
    Option,
    Select
  ],
  templateUrl: './clearable-filter-trigger-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './clearable-filter-trigger-example.scss'
})
export class ClearableFilterTriggerExample {
  readonly statuses = form(signal<string[]>(['Active', 'Pending']));
  readonly statusOptions = signal(['Active', 'Pending', 'Blocked', 'Archived']);
}
