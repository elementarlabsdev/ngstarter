import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CurrencySelect } from '@ngstarter-ui/components/currency-select';
import { FormField as SignalFormField, form } from '@angular/forms/signals';
import { FormField, Label } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-basic-currency-select-example',
  imports: [
    CurrencySelect,
    SignalFormField,
    FormField,
    Label
  ],
  templateUrl: './basic-currency-select-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-currency-select-example.scss'
})
export class BasicCurrencySelectExample {
  readonly currency = form(signal<string | null>('USD'));
}
