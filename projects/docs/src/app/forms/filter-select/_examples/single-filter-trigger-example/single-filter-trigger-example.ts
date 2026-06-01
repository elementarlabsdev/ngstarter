import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FilterTrigger, Option, Select } from '@ngstarter-ui/components/select';

@Component({
  selector: 'app-single-filter-trigger-example',
  imports: [
    ReactiveFormsModule,
    FilterTrigger,
    Option,
    Select
  ],
  templateUrl: './single-filter-trigger-example.html',
  styleUrl: './single-filter-trigger-example.scss'
})
export class SingleFilterTriggerExample {
  readonly priority = signal(new FormControl('High'));
  readonly priorities = signal(['Low', 'Medium', 'High', 'Urgent']);
}
