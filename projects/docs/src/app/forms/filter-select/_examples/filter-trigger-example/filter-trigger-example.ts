import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FilterTrigger, Option, Select } from '@ngstarter-ui/components/select';

@Component({
  selector: 'app-filter-trigger-example',
  imports: [
    ReactiveFormsModule,
    FilterTrigger,
    Option,
    Select
  ],
  templateUrl: './filter-trigger-example.html',
  styleUrl: './filter-trigger-example.scss'
})
export class FilterTriggerExample {
  readonly statuses = signal(new FormControl<string[]>([]));
  readonly statusOptions = signal(['Active', 'Pending', 'Blocked', 'Archived']);
}
