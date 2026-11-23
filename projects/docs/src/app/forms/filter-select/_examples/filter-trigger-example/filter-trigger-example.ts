import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { FilterTrigger, Option, Select } from '@ngstarter-ui/components/select';

@Component({
  selector: 'app-filter-trigger-example',
  imports: [
    SignalFormField,
    FilterTrigger,
    Option,
    Select
  ],
  templateUrl: './filter-trigger-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './filter-trigger-example.scss'
})
export class FilterTriggerExample {
  readonly statuses = form(signal<string[]>([]));
  readonly statusOptions = signal(['Active', 'Pending', 'Blocked', 'Archived']);
}
