import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicComparisonSliderExample
} from '../_examples/basic-comparison-slider-example/basic-comparison-slider-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicComparisonSliderExample
  ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './overview.scss'
})
export class Overview {

}
