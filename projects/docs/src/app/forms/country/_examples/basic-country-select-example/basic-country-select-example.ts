import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CountrySelect, CountrySelectValue } from '@ngstarter-ui/components/country-select';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { FormField as SignalFormField, form } from '@angular/forms/signals';

@Component({
  selector: 'app-basic-country-select-example',
  imports: [
    FormField,
    Label,
    CountrySelect,
    SignalFormField
  ],
  templateUrl: './basic-country-select-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-country-select-example.scss'
})
export class BasicCountrySelectExample {
  readonly country = form(signal<CountrySelectValue>('US'));
}
