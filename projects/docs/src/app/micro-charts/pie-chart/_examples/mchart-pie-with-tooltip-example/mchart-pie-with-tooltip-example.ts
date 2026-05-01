import { Component } from '@angular/core';
import {
  MchartPie,
  MchartTooltipBody,
  MchartTooltip,
  MchartTooltipTitle
} from '@ngstarter/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';

@Component({
  selector: 'app-mchart-pie-with-tooltip-example',
  imports: [
    MchartPie,
    ShuffleArrayPipe,
    MchartTooltipBody,
    MchartTooltip,
    MchartTooltipTitle
  ],
  templateUrl: './mchart-pie-with-tooltip-example.html',
  styleUrl: './mchart-pie-with-tooltip-example.scss'
})
export class MchartPieWithTooltipExample {
  data1 = [1, 2, 3];
  data2 = [5, 2, 3];
  data3 = [1, 2, 3, 4];
  data4 = [6, 2, 3, 8, 10];
  labels = ['Chrome', 'Edge', 'Opera', 'Firefox', 'Safari'];
}
