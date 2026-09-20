import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MchartBar } from '@ngstarter-ui/components/micro-chart';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';

@Component({
  selector: 'app-mchart-bar-fill-gradient-example',
  imports: [
    MchartBar,
    ShuffleArrayPipe
  ],
  templateUrl: './mchart-bar-fill-gradient-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './mchart-bar-fill-gradient-example.scss'
})
export class MchartBarFillGradientExample {

}
