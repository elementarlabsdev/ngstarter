import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FilterTrigger, FilterTriggerValueDirective, Option, Select } from '@ngstarter-ui/components/select';

interface StatusOption {
  id: string;
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}

@Component({
  selector: 'app-custom-value-filter-trigger-example',
  imports: [
    ReactiveFormsModule,
    FilterTrigger,
    FilterTriggerValueDirective,
    Option,
    Select
  ],
  templateUrl: './custom-value-filter-trigger-example.html'
})
export class CustomValueFilterTriggerExample {
  readonly status = signal(new FormControl('blocked'));
  readonly statuses = signal<StatusOption[]>([
    { id: 'active', label: 'Active', tone: 'success' },
    { id: 'pending', label: 'Pending', tone: 'warning' },
    { id: 'blocked', label: 'Blocked', tone: 'danger' },
    { id: 'archived', label: 'Archived', tone: 'neutral' }
  ]);
}
