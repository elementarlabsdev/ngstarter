import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicPhoneInputExample
} from '../_examples/basic-phone-input-example/basic-phone-input-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';
import {
  PhoneInputOnlyCountriesExample
} from '../_examples/phone-input-only-countries-example/phone-input-only-countries-example';
import {
  PhoneInputPreferredCountriesExample
} from '../_examples/phone-input-preferred-countries-example/phone-input-preferred-countries-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicPhoneInputExample,
    Page,
    PageContentDirective,
    Tab,
    TabGroup,
    PhoneInputOnlyCountriesExample,
    PhoneInputPreferredCountriesExample,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
