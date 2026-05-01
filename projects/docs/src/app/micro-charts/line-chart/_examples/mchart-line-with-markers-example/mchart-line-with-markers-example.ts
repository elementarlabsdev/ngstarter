import { Component } from '@angular/core';
import { MchartLine } from '@ngstarter-ui/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';

@Component({
  selector: 'app-mchart-line-with-markers-example',
  imports: [
    MchartLine,
    ShuffleArrayPipe
  ],
  templateUrl: './mchart-line-with-markers-example.html',
  styleUrl: './mchart-line-with-markers-example.scss'
})
export class MchartLineWithMarkersExample {

}
