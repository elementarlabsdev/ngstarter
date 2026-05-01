import { Component } from '@angular/core';
import { Timepicker, TimepickerInput, TimepickerToggle } from '@ngstarter-ui/components/timepicker';
import { FormField, IconButtonSuffix, Label, Suffix } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'app-basic-timepicker-example',
  imports: [
    Timepicker,
    TimepickerToggle,
    Input,
    Label,
    FormField,
    TimepickerInput,
    IconButtonSuffix
  ],
  templateUrl: './basic-timepicker-example.html',
  styleUrl: './basic-timepicker-example.scss'
})
export class BasicTimepickerExample {

}
