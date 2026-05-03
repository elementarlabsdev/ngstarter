import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  MchartPieBasicExample
} from '../_examples/mchart-pie-basic-example/mchart-pie-basic-example';
import {
  MchartPieWithLegendExample
} from '../_examples/mchart-pie-with-legend-example/mchart-pie-with-legend-example';
import {
  MchartPieValueOnSlicesExample
} from '../_examples/mchart-pie-value-on-slices-example/mchart-pie-value-on-slices-example';
import {
  MchartPieWithTooltipExample
} from '../_examples/mchart-pie-with-tooltip-example/mchart-pie-with-tooltip-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    MchartPieBasicExample,
    MchartPieWithLegendExample,
    MchartPieValueOnSlicesExample,
    MchartPieWithTooltipExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
