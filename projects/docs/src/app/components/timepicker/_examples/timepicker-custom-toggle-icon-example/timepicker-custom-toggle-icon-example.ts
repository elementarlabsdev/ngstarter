import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  Timepicker,
  TimepickerInput,
  TimepickerToggle,
  TimepickerToggleIcon
} from '@ngstarter-ui/components/timepicker';
import { FormField, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

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
