import { Component } from '@angular/core';
import { MchartLine } from '@ngstarter-ui/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';

@Component({
  selector: 'app-mchart-line-basic-example',
  imports: [
    MchartLine,
    ShuffleArrayPipe
  ],
  templateUrl: './mchart-line-basic-example.html',
  styleUrl: './mchart-line-basic-example.scss'
})
export class MchartLineBasicExample {

}
