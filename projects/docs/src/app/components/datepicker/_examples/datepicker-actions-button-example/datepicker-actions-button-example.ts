import { Component } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import {
  Datepicker,
  DatepickerActions,
  DatepickerApply,
  DatepickerCancel,
  DatepickerInput,
  DatepickerToggle,
  provideNativeDateAdapter
} from '@ngstarter/components/datepicker';
import { FormField, Hint, IconButtonSuffix, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';

@Component({
  selector: 'app-datepicker-actions-button-example',
  imports: [
    Button,
    Datepicker,
    DatepickerToggle,
    Hint,
    Input,
    Label,
    FormField,
    DatepickerInput,
    DatepickerActions,
    DatepickerApply,
    DatepickerCancel,
    IconButtonSuffix
  ],
  templateUrl: './datepicker-actions-button-example.html',
  styleUrl: './datepicker-actions-button-example.scss',
  providers: [
    provideNativeDateAdapter()
  ]
})
export class DatepickerActionsButtonExample {

}
