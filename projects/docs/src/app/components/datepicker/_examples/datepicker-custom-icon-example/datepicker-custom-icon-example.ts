import { Component } from '@angular/core';
import {
  Datepicker,
  DatepickerInput,
  DatepickerToggle,
  DatepickerToggleIcon,
  provideNativeDateAdapter
} from '@ngstarter-ui/components/datepicker';
import { FormField, Hint, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-datepicker-custom-icon-example',
  imports: [
    Datepicker,
    DatepickerInput,
    DatepickerToggle,
    DatepickerToggleIcon,
    FormField,
    Hint,
    Input,
    Label,
    Icon,
    IconButtonSuffix
  ],
  templateUrl: './datepicker-custom-icon-example.html',
  styleUrl: './datepicker-custom-icon-example.scss',
  providers: [
    provideNativeDateAdapter()
  ]
})
export class DatepickerCustomIconExample {

}
