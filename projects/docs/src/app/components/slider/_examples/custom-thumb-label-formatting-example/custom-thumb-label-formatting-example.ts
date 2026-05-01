import { Component } from '@angular/core';
import { Slider, SliderThumb } from '@ngstarter/components/slider';

@Component({
  selector: 'app-custom-thumb-label-formatting-example',
  imports: [
    Slider,
    SliderThumb
  ],
  templateUrl: './custom-thumb-label-formatting-example.html',
  styleUrl: './custom-thumb-label-formatting-example.scss'
})
export class CustomThumbLabelFormattingExample {
  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return `${value}`;
  }
}
