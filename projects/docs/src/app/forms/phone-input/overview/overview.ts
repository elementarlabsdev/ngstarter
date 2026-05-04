import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicPhoneInputExample
} from '../_examples/basic-phone-input-example/basic-phone-input-example';
import {
  PhoneInputOnlyCountriesExample
} from '../_examples/phone-input-only-countries-example/phone-input-only-countries-example';
import {
  PhoneInputPreferredCountriesExample
} from '../_examples/phone-input-preferred-countries-example/phone-input-preferred-countries-example';

@Component({
  imports: [
    Playground,
    BasicPhoneInputExample,
    PhoneInputOnlyCountriesExample,
    PhoneInputPreferredCountriesExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
