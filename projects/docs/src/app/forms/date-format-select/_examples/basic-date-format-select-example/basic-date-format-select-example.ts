import { Component } from '@angular/core';
import { DateFormatSelect } from '@ngstarter-ui/components/date-format-select';
import { Error, FormField, Label } from '@ngstarter-ui/components/form-field';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-basic-date-format-select-example',
  imports: [
    Error,
    DateFormatSelect,
    Label,
    FormField,
    ReactiveFormsModule
  ],
  templateUrl: './basic-date-format-select-example.html',
  styleUrl: './basic-date-format-select-example.scss'
})
export class BasicDateFormatSelectExample {
  readonly settingsForm = new FormGroup({
    // dateFormat: new FormControl<string | null>('yyyy-MM-dd', Validators.required),
    dateFormat: new FormControl<string | null>(null, Validators.required),
  });

  get dateFormatControl(): FormControl | null {
    return this.settingsForm.get('dateFormat') as FormControl | null;
  }
}
