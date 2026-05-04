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

@Component({
  imports: [
    Playground,
    BasicPinInputExample,
    PinInputWithPlaceholderExample,
    PinInputLengthExample,
    PinInputAcceptCustomSymbolsExample
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
