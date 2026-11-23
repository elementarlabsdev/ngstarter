import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { Timepicker, TimepickerInput, TimepickerToggle } from '@ngstarter-ui/components/timepicker';
import { FormField, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-basic-timepicker-example',
  imports: [
    SignalFormField,
    Timepicker,
    TimepickerToggle,
    Input,
    Label,
    FormField,
    TimepickerInput,
    IconButtonSuffix
  ],
  templateUrl: './basic-timepicker-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-timepicker-example.scss'
})
export class BasicTimepickerExample {
  readonly time = form(signal<string | null>(null));
}
