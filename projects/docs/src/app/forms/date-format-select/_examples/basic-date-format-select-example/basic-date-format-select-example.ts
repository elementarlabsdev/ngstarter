import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { DateFormatSelect } from '@ngstarter-ui/components/date-format-select';
import { Error, FormField, Label } from '@ngstarter-ui/components/form-field';
import { FormField as SignalFormField, form, required } from '@angular/forms/signals';

@Component({
  selector: 'app-basic-date-format-select-example',
  imports: [
    Error,
    DateFormatSelect,
    Label,
    FormField,
    SignalFormField
  ],
  templateUrl: './basic-date-format-select-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-date-format-select-example.scss'
})
export class BasicDateFormatSelectExample {
  readonly settingsForm = form(signal<{ dateFormat: string | null }>({ dateFormat: null }), path => {
    required(path.dateFormat);
  });
}
