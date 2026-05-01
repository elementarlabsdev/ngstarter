import { Component } from '@angular/core';
import { MchartLine } from '@ngstarter-ui/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';

@Component({
  selector: 'app-mchart-line-compact-example',
  imports: [
    MchartLine,
    ShuffleArrayPipe
  ],
  templateUrl: './mchart-line-compact-example.html',
  styleUrl: './mchart-line-compact-example.scss'
})
export class MchartLineCompactExample {

}
