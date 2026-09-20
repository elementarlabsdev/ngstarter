import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MchartBar } from '@ngstarter-ui/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';

@Component({
  selector: 'app-mchart-bar-with-bar-highlight-example',
  imports: [
    MchartBar,
    ShuffleArrayPipe
  ],
  templateUrl: './mchart-bar-with-bar-highlight-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './mchart-bar-with-bar-highlight-example.scss'
})
export class MchartBarWithBarHighlightExample {

}
