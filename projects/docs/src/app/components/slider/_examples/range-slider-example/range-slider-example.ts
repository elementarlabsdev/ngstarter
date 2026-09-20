import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Slider, SliderStartThumb, SliderEndThumb } from '@ngstarter-ui/components/slider';

@Component({
  selector: 'app-range-slider-example',
  imports: [
    Slider,
    SliderStartThumb,
    SliderEndThumb
  ],
  templateUrl: './range-slider-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './range-slider-example.scss'
})
export class RangeSliderExample {

}
