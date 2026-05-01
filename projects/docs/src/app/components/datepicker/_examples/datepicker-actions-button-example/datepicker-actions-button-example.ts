import { Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  Datepicker,
  DatepickerActions,
  DatepickerApply,
  DatepickerCancel,
  DatepickerInput,
  DatepickerToggle,
  provideNativeDateAdapter
} from '@ngstarter-ui/components/datepicker';
import { FormField, Hint, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';

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
