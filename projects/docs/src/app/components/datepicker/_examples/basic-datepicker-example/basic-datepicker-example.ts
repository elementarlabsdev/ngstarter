import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { provideNativeDateAdapter } from '@ngstarter-ui/components/datepicker';
import { Datepicker, DatepickerInput, DatepickerToggle } from '@ngstarter-ui/components/datepicker';
import {
  FormField,
  Hint,
  IconButtonSuffix,
  Label
} from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-basic-datepicker-example',
  imports: [
    SignalFormField,
    Datepicker,
    DatepickerToggle,
    Hint,
    Input,
    DatepickerInput,
    Label,
    FormField,
    IconButtonSuffix
  ],
  templateUrl: './basic-datepicker-example.html',
  styleUrl: './basic-datepicker-example.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [
    provideNativeDateAdapter()
  ]
})
export class BasicDatepickerExample {
  readonly date = form(signal<Date | null>(null));
}
