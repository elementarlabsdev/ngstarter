import { Component } from '@angular/core';
import { MchartPie } from '@ngstarter-ui/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';

@Component({
  selector: 'app-mchart-pie-value-on-slices-example',
  imports: [
    MchartPie,
    ShuffleArrayPipe
  ],
  templateUrl: './mchart-pie-value-on-slices-example.html',
  styleUrl: './mchart-pie-value-on-slices-example.scss'
})
export class MchartPieValueOnSlicesExample {
  data1 = [1, 2, 3];
  data2 = [5, 2, 3];
  data3 = [1, 2, 3, 4];
  data4 = [6, 2, 3, 8, 10];
}
