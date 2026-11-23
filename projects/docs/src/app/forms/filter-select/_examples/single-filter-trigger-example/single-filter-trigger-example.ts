import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { FilterTrigger, Option, Select } from '@ngstarter-ui/components/select';

@Component({
  selector: 'app-single-filter-trigger-example',
  imports: [
    SignalFormField,
    FilterTrigger,
    Option,
    Select
  ],
  templateUrl: './single-filter-trigger-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './single-filter-trigger-example.scss'
})
export class SingleFilterTriggerExample {
  readonly priority = form(signal('High'));
  readonly priorities = signal(['Low', 'Medium', 'High', 'Urgent']);
}
