import { Component } from '@angular/core';
import { provideNativeDateAdapter } from '@ngstarter/components/datepicker';
import { CustomHeader } from '../custom-header/custom-header';
import { Datepicker, DatepickerInput, DatepickerToggle } from '@ngstarter/components/datepicker';
import { FormField, Hint, IconButtonSuffix, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'app-datepicker-with-custom-header-example',
  imports: [
    Datepicker,
    DatepickerToggle,
    Hint,
    Input,
    Label,
    FormField,
    DatepickerInput,
    IconButtonSuffix,
  ],
  templateUrl: './datepicker-with-custom-header-example.html',
  styleUrl: './datepicker-with-custom-header-example.scss',
  providers: [
    provideNativeDateAdapter()
  ]
})
export class DatepickerWithCustomHeaderExample {
  exampleHeader = CustomHeader;
}
