import { Component } from '@angular/core';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';
import {
  MchartBar,
  MchartTooltipBody,
  MchartTooltip, MchartTooltipTitle
} from '@ngstarter-ui/components/micro-chart';

@Component({
  selector: 'app-mchart-bar-with-tooltip-example',
  imports: [
    MchartBar,
    ShuffleArrayPipe,
    MchartTooltipBody,
    MchartTooltip,
    MchartTooltipTitle
  ],
  templateUrl: './mchart-bar-with-tooltip-example.html',
  styleUrl: './mchart-bar-with-tooltip-example.scss'
})
export class MchartBarWithTooltipExample {
}
