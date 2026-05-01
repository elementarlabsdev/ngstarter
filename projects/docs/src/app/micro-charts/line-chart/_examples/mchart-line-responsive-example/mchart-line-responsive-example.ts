import { Component } from '@angular/core';
import { ShuffleArrayPipe } from '@meta/shuffle-array.pipe';
import {
  MchartLine,
  MchartTooltipBody,
  MchartTooltip, MchartTooltipTitle
} from '@ngstarter/components/micro-chart';
import { ResizableContainer } from '@ngstarter/components/resizable-container';

@Component({
  selector: 'app-mchart-line-responsive-example',
  imports: [
    MchartLine,
    MchartTooltipBody,
    MchartTooltip,
    MchartTooltipTitle,
    ShuffleArrayPipe,
    ResizableContainer
  ],
  templateUrl: './mchart-line-responsive-example.html',
  styleUrl: './mchart-line-responsive-example.scss'
})
export class MchartLineResponsiveExample {

}
