import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicPinInputExample } from '../_examples/basic-pin-input-example/basic-pin-input-example';
import {
  PinInputWithPlaceholderExample
} from '../_examples/pin-input-with-placeholder-example/pin-input-with-placeholder-example';
import {
  PinInputLengthExample
} from '../_examples/pin-input-length-example/pin-input-length-example';
import {
  PinInputAcceptCustomSymbolsExample
} from '../_examples/pin-input-accept-custom-symbols-example/pin-input-accept-custom-symbols-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicPinInputExample,
    PinInputWithPlaceholderExample,
    PinInputLengthExample,
    PinInputAcceptCustomSymbolsExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
