import { Component } from '@angular/core';
import {
  ComparisonSliderAfterImageDirective,
  ComparisonSliderBeforeImageDirective,
  ComparisonSlider
} from '@ngstarter/components/comparison-slider';

@Component({
  selector: 'app-basic-comparison-slider-example',
  imports: [
    ComparisonSlider,
    ComparisonSliderBeforeImageDirective,
    ComparisonSliderAfterImageDirective
  ],
  templateUrl: './basic-comparison-slider-example.html',
  styleUrl: './basic-comparison-slider-example.scss'
})
export class BasicComparisonSliderExample {

}
