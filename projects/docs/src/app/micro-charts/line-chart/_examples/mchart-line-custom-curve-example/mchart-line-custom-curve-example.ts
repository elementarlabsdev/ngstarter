import { Component } from '@angular/core';
import { MchartLine } from '@ngstarter-ui/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';

@Component({
  selector: 'app-mchart-line-custom-curve-example',
  imports: [
    MchartLine,
    ShuffleArrayPipe
  ],
  templateUrl: './mchart-line-custom-curve-example.html',
  styleUrl: './mchart-line-custom-curve-example.scss'
})
export class MchartLineCustomCurveExample {

}
