import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicSliderExample } from '../_examples/basic-slider-example/basic-slider-example';
import {
  CustomThumbLabelFormattingExample
} from '../_examples/custom-thumb-label-formatting-example/custom-thumb-label-formatting-example';
import { RangeSliderExample } from '../_examples/range-slider-example/range-slider-example';
import {
  ConfigurableSliderExample
} from '../_examples/configurable-slider-example/configurable-slider-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicSliderExample,
    CustomThumbLabelFormattingExample,
    RangeSliderExample,
    ConfigurableSliderExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
