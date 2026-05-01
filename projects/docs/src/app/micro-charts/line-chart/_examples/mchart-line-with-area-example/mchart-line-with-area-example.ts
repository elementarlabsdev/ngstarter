import { Component } from '@angular/core';
import { MchartLine } from '@ngstarter-ui/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';

@Component({
  selector: 'app-mchart-line-with-area-example',
  imports: [
    MchartLine,
    ShuffleArrayPipe
  ],
  templateUrl: './mchart-line-with-area-example.html',
  styleUrl: './mchart-line-with-area-example.scss'
})
export class MchartLineWithAreaExample {

}
