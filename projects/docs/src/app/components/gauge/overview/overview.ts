import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicGaugeExample } from '../_examples/basic-gauge-example/basic-gauge-example';
import {
  GaugeWithValueExample
} from '../_examples/gauge-with-value-example/gauge-with-value-example';
import {
  GaugeCustomSizeExample
} from '../_examples/gauge-custom-size-example/gauge-custom-size-example';
import {
  GaugeCustomStrokeWidthExample
} from '../_examples/gauge-custom-stroke-width-example/gauge-custom-stroke-width-example';

@Component({
  imports: [
    Playground,
    BasicGaugeExample,
    GaugeWithValueExample,
    GaugeCustomSizeExample,
    GaugeCustomStrokeWidthExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
}
