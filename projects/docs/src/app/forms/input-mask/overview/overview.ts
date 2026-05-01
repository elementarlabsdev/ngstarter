import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import {
  CreditCardInputMaskExample
} from '../_examples/credit-card-input-mask-example/credit-card-input-mask-example';
import {
  CreditCardExpiryInputMaskExample
} from '../_examples/credit-card-expiry-input-mask-example/credit-card-expiry-input-mask-example';
import {
  CreditCardCvvInputMaskExample
} from '../_examples/credit-card-cvv-input-mask-example/credit-card-cvv-input-mask-example';

@Component({
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    CreditCardInputMaskExample,
    CreditCardExpiryInputMaskExample,
    CreditCardCvvInputMaskExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
