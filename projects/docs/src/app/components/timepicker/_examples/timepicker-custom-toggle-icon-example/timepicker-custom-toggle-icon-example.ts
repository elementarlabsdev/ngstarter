import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import {
  Timepicker,
  TimepickerInput,
  TimepickerToggle,
  TimepickerToggleIcon
} from '@ngstarter/components/timepicker';
import { FormField, IconButtonSuffix, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'app-timepicker-custom-toggle-icon-example',
  imports: [
    Icon,
    Timepicker,
    TimepickerToggle,
    TimepickerToggleIcon,
    Input,
    Label,
    FormField,
    TimepickerInput,
    IconButtonSuffix
  ],
  templateUrl: './timepicker-custom-toggle-icon-example.html',
  styleUrl: './timepicker-custom-toggle-icon-example.scss'
})
export class TimepickerCustomToggleIconExample {

}
