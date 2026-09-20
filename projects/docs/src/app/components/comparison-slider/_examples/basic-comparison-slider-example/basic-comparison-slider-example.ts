import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  ComparisonSliderAfterImageDirective,
  ComparisonSliderBeforeImageDirective,
  ComparisonSlider
} from '@ngstarter-ui/components/comparison-slider';

@Component({
  selector: 'app-basic-comparison-slider-example',
  imports: [
    ComparisonSlider,
    ComparisonSliderBeforeImageDirective,
    ComparisonSliderAfterImageDirective
  ],
  templateUrl: './basic-comparison-slider-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-comparison-slider-example.scss'
})
export class BasicComparisonSliderExample {

}
