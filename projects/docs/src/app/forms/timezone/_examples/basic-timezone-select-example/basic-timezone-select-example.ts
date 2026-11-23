import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { TimezoneSelect } from '@ngstarter-ui/components/timezone-select';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { FormField as SignalFormField, form } from '@angular/forms/signals';

@Component({
  selector: 'app-basic-timezone-select-example',
  imports: [
    TimezoneSelect,
    FormField,
    Label,
    SignalFormField
  ],
  templateUrl: './basic-timezone-select-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-timezone-select-example.scss'
})
export class BasicTimezoneSelectExample {
  readonly selectedTimezone = form(signal<string | null>(null));
}
