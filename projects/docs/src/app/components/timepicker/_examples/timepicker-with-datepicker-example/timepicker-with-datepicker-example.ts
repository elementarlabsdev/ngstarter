import { Component } from '@angular/core';
import { Input } from '@ngstarter-ui/components/input';
import { Datepicker, DatepickerInput, DatepickerToggle } from '@ngstarter-ui/components/datepicker';
import { FormField, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { FormsModule } from '@angular/forms';
import { Timepicker, TimepickerInput, TimepickerToggle } from '@ngstarter-ui/components/timepicker';

@Component({
  selector: 'app-timepicker-with-datepicker-example',
  imports: [
    Input,
    Datepicker,
    DatepickerToggle,
    DatepickerInput,
    FormsModule,
    Label,
    FormField,
    Timepicker,
    TimepickerToggle,
    TimepickerInput,
    IconButtonSuffix
  ],
  templateUrl: './timepicker-with-datepicker-example.html',
  styleUrl: './timepicker-with-datepicker-example.scss'
})
export class TimepickerWithDatepickerExample {
  value: Date;
}
