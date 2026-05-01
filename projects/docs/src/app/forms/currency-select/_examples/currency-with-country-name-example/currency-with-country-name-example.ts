import { Component, model } from '@angular/core';
import { CurrencySelect } from '@ngstarter/components/currency-select';
import { FormField, Label } from '@ngstarter/components/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-currency-with-country-name-example',
  imports: [
    CurrencySelect,
    FormField,
    Label,
    FormsModule
  ],
  templateUrl: './currency-with-country-name-example.html',
  styleUrl: './currency-with-country-name-example.scss'
})
export class CurrencyWithCountryNameExample {
  currency = model('USD');
}
