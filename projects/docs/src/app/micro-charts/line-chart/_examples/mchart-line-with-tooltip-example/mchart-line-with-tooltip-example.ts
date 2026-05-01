import { Component } from '@angular/core';
import {
  MchartLine,
  MchartTooltipBody,
  MchartTooltip,
  MchartTooltipTitle
} from '@ngstarter-ui/components/micro-chart';

@Component({
  selector: 'app-mchart-line-with-tooltip-example',
  imports: [
    MchartLine,
    MchartTooltipTitle,
    MchartTooltipBody,
    MchartTooltip
  ],
  templateUrl: './mchart-line-with-tooltip-example.html',
  styleUrl: './mchart-line-with-tooltip-example.scss'
})
export class MchartLineWithTooltipExample {

}
