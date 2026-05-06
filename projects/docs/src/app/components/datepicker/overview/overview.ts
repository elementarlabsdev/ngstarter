import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicDatepickerExample
} from '../_examples/basic-datepicker-example/basic-datepicker-example';
import {
  DatepickerCustomIconExample
} from '../_examples/datepicker-custom-icon-example/datepicker-custom-icon-example';
import {
  DatepickerWithCustomHeaderExample
} from '../_examples/datepicker-with-custom-header-example/datepicker-with-custom-header-example';
import {
  DatepickerActionsButtonExample
} from '../_examples/datepicker-actions-button-example/datepicker-actions-button-example';
import {
  BasicDateRangePickerExample
} from '../_examples/basic-date-range-picker-example/basic-date-range-picker-example';
import {
  DatepickerPresetsExample
} from '../_examples/datepicker-presets-example/datepicker-presets-example';
import { provideNativeDateAdapter } from '@ngstarter-ui/components/datepicker';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicDatepickerExample,
    DatepickerCustomIconExample,
    DatepickerWithCustomHeaderExample,
    DatepickerActionsButtonExample,
    BasicDateRangePickerExample,
    DatepickerPresetsExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
  providers: [
    provideNativeDateAdapter()
  ]
})
export class Overview {

}
