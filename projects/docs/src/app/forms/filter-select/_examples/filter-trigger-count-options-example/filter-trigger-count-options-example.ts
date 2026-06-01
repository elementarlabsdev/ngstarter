import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FilterTrigger, Option, Select } from '@ngstarter-ui/components/select';

@Component({
  selector: 'app-filter-trigger-count-options-example',
  imports: [
    ReactiveFormsModule,
    FilterTrigger,
    Option,
    Select
  ],
  templateUrl: './filter-trigger-count-options-example.html',
  styleUrl: './filter-trigger-count-options-example.scss'
})
export class FilterTriggerCountOptionsExample {
  readonly teams = signal(new FormControl<string[]>(['Design', 'Engineering', 'Operations', 'Support']));
  readonly emptyTeams = signal(new FormControl<string[]>([]));
  readonly teamOptions = signal(['Design', 'Engineering', 'Finance', 'Operations', 'Product', 'Sales', 'Support']);
}
