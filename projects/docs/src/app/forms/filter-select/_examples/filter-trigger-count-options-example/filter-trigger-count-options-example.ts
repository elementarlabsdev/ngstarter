import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { FilterTrigger, Option, Select } from '@ngstarter-ui/components/select';

@Component({
  selector: 'app-filter-trigger-count-options-example',
  imports: [
    SignalFormField,
    FilterTrigger,
    Option,
    Select
  ],
  templateUrl: './filter-trigger-count-options-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './filter-trigger-count-options-example.scss'
})
export class FilterTriggerCountOptionsExample {
  readonly teams = form(signal<string[]>(['Design', 'Engineering', 'Operations', 'Support']));
  readonly emptyTeams = form(signal<string[]>([]));
  readonly teamOptions = signal(['Design', 'Engineering', 'Finance', 'Operations', 'Product', 'Sales', 'Support']);
}
