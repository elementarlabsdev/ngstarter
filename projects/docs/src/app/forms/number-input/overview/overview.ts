import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicNumberInputExample
} from '../_examples/basic-number-input-example/basic-number-input-example';
import {
  NumberInputCustomControlsExample
} from '../_examples/number-input-custom-controls-example/number-input-custom-controls-example';
import {
  NumberInputMinMaxExample
} from '../_examples/number-input-min-max-example/number-input-min-max-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicNumberInputExample,
    NumberInputCustomControlsExample,
    NumberInputMinMaxExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
}
