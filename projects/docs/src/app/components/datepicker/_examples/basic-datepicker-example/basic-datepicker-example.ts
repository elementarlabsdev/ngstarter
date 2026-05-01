import { Component } from '@angular/core';
import { provideNativeDateAdapter } from '@ngstarter/components/datepicker';
import { Datepicker, DatepickerInput, DatepickerToggle } from '@ngstarter/components/datepicker';
import {
  FormField,
  Hint,
  IconButtonSuffix,
  Label
} from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'app-basic-datepicker-example',
  imports: [
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
  providers: [
    provideNativeDateAdapter()
  ]
})
export class BasicDatepickerExample {

}
