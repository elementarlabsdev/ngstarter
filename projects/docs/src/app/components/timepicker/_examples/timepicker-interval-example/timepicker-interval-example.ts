import { Component } from '@angular/core';
import { Timepicker, TimepickerInput, TimepickerToggle } from '@ngstarter-ui/components/timepicker';
import { FormField, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-timepicker-interval-example',
  imports: [
    Timepicker,
    TimepickerToggle,
    Input,
    Label,
    FormField,
    TimepickerInput,
    IconButtonSuffix
  ],
  templateUrl: './timepicker-interval-example.html',
  styleUrl: './timepicker-interval-example.scss'
})
export class TimepickerIntervalExample {

}
