import { Component } from '@angular/core';
import { MchartPie } from '@ngstarter/components/micro-chart';

@Component({
  selector: 'app-mchart-pie-with-legend-example',
  imports: [
    MchartPie
  ],
  templateUrl: './mchart-pie-with-legend-example.html',
  styleUrl: './mchart-pie-with-legend-example.scss'
})
export class MchartPieWithLegendExample {
  data = [6, 2, 3, 8, 10];
  labels = ['Chrome', 'Edge', 'Opera', 'Firefox', 'Safari'];
}
