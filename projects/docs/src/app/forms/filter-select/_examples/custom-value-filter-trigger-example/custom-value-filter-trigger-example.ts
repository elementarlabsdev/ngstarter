import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { FilterTrigger, FilterTriggerValueDirective, Option, Select } from '@ngstarter-ui/components/select';

interface StatusOption {
  id: string;
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}

@Component({
  selector: 'app-custom-value-filter-trigger-example',
  imports: [
    SignalFormField,
    FilterTrigger,
    FilterTriggerValueDirective,
    Option,
    Select
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './custom-value-filter-trigger-example.html'
})
export class CustomValueFilterTriggerExample {
  readonly status = form(signal('blocked'));
  readonly statuses = signal<StatusOption[]>([
    { id: 'active', label: 'Active', tone: 'success' },
    { id: 'pending', label: 'Pending', tone: 'warning' },
    { id: 'blocked', label: 'Blocked', tone: 'danger' },
    { id: 'archived', label: 'Archived', tone: 'neutral' }
  ]);
}
