import { Component } from '@angular/core';
import { Gauge, GaugeValue } from '@ngstarter/components/gauge';

@Component({
  selector: 'app-gauge-custom-size-example',
  imports: [
    Gauge,
    GaugeValue
  ],
  templateUrl: './gauge-custom-size-example.html',
  styleUrl: './gauge-custom-size-example.scss'
})
export class GaugeCustomSizeExample {

}
