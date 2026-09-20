import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FilterTrigger, Option, Select } from '@ngstarter-ui/components/select';

@Component({
  selector: 'app-clearable-filter-trigger-example',
  imports: [
    ReactiveFormsModule,
    FilterTrigger,
    Option,
    Select
  ],
  templateUrl: './clearable-filter-trigger-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './clearable-filter-trigger-example.scss'
})
export class ClearableFilterTriggerExample {
  readonly statuses = signal(new FormControl<string[]>(['Active', 'Pending']));
  readonly statusOptions = signal(['Active', 'Pending', 'Blocked', 'Archived']);
}
