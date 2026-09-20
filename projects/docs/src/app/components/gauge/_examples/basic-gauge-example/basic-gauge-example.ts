import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Gauge } from '@ngstarter-ui/components/gauge';

@Component({
  selector: 'app-basic-gauge-example',
  imports: [
    Gauge
  ],
  templateUrl: './basic-gauge-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-gauge-example.scss'
})
export class BasicGaugeExample {

}
