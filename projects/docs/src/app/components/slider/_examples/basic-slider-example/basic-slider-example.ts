import { Component } from '@angular/core';
import { Slider, SliderThumb } from '@ngstarter/components/slider';

@Component({
  selector: 'app-basic-slider-example',
  imports: [
    Slider,
    SliderThumb
  ],
  templateUrl: './basic-slider-example.html',
  styleUrl: './basic-slider-example.scss'
})
export class BasicSliderExample {

}
