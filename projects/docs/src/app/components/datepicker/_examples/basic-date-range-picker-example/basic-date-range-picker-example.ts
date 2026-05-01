import { Component } from '@angular/core';
import { Hint, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { FormField } from '@ngstarter-ui/components/form-field';
import {
  DatepickerToggle,
  DateRangeInput,
  DateRangePicker,
  EndDate,
  StartDate
} from '@ngstarter-ui/components/datepicker';
import { provideNativeDateAdapter } from '@ngstarter-ui/components/datepicker';

@Component({
  selector: 'app-basic-date-range-picker-example',
  imports: [
    Label,
    FormField,
    Hint,
    DatepickerToggle,
    DateRangeInput,
    DateRangePicker,
    StartDate,
    EndDate,
    IconButtonSuffix
  ],
  templateUrl: './basic-date-range-picker-example.html',
  styleUrl: './basic-date-range-picker-example.scss',
  providers: [
    provideNativeDateAdapter()
  ]
})
export class BasicDateRangePickerExample {

}
