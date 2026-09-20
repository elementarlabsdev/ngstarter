import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Slider, SliderThumb } from '@ngstarter-ui/components/slider';

@Component({
  selector: 'app-basic-slider-example',
  imports: [
    Slider,
    SliderThumb
  ],
  templateUrl: './basic-slider-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-slider-example.scss'
})
export class BasicSliderExample {

}
