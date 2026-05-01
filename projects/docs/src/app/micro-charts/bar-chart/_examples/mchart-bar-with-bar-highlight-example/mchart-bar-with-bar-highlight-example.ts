import { Component } from '@angular/core';
import { MchartBar } from '@ngstarter-ui/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';

@Component({
  selector: 'app-mchart-bar-with-bar-highlight-example',
  imports: [
    MchartBar,
    ShuffleArrayPipe
  ],
  templateUrl: './mchart-bar-with-bar-highlight-example.html',
  styleUrl: './mchart-bar-with-bar-highlight-example.scss'
})
export class MchartBarWithBarHighlightExample {

}
