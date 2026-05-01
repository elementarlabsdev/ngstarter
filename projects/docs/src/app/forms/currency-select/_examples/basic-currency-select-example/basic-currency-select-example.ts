import { Component, model } from '@angular/core';
import { CurrencySelect } from '@ngstarter/components/currency-select';
import { FormsModule } from '@angular/forms';
import { FormField, Label } from '@ngstarter/components/form-field';

@Component({
  selector: 'app-basic-currency-select-example',
  imports: [
    CurrencySelect,
    FormsModule,
    FormField,
    Label
  ],
  templateUrl: './basic-currency-select-example.html',
  styleUrl: './basic-currency-select-example.scss'
})
export class BasicCurrencySelectExample {
  currency = model('USD');
}
