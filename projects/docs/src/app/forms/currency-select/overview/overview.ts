import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicCurrencySelectExample
} from '../_examples/basic-currency-select-example/basic-currency-select-example';
import {
  CurrencyWithCountryNameExample
} from '../_examples/currency-with-country-name-example/currency-with-country-name-example';

@Component({
  imports: [
    Playground,
    BasicCurrencySelectExample,
    CurrencyWithCountryNameExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
