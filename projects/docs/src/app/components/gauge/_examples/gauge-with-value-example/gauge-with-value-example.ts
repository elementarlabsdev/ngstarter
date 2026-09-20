import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Gauge, GaugeValue } from '@ngstarter-ui/components/gauge';

@Component({
  selector: 'app-gauge-with-value-example',
  imports: [
    GaugeValue,
    Gauge
  ],
  templateUrl: './gauge-with-value-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './gauge-with-value-example.scss'
})
export class GaugeWithValueExample {

}
