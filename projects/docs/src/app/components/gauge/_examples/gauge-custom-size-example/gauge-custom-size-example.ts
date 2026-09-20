import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Gauge, GaugeValue } from '@ngstarter-ui/components/gauge';

@Component({
  selector: 'app-gauge-custom-size-example',
  imports: [
    Gauge,
    GaugeValue
  ],
  templateUrl: './gauge-custom-size-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './gauge-custom-size-example.scss'
})
export class GaugeCustomSizeExample {

}
