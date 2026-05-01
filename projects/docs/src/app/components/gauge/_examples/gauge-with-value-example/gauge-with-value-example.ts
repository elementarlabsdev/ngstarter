import { Component } from '@angular/core';
import { Gauge, GaugeValue } from '@ngstarter/components/gauge';

@Component({
  selector: 'app-gauge-with-value-example',
  imports: [
    GaugeValue,
    Gauge
  ],
  templateUrl: './gauge-with-value-example.html',
  styleUrl: './gauge-with-value-example.scss'
})
export class GaugeWithValueExample {

}
