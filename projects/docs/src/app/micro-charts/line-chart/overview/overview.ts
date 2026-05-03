import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  MchartLineWithTooltipExample
} from '../_examples/mchart-line-with-tooltip-example/mchart-line-with-tooltip-example';
import {
  MchartLineBasicExample
} from '../_examples/mchart-line-basic-example/mchart-line-basic-example';
import {
  MchartLineCustomCurveExample
} from '../_examples/mchart-line-custom-curve-example/mchart-line-custom-curve-example';
import {
  MchartLineWithAreaExample
} from '../_examples/mchart-line-with-area-example/mchart-line-with-area-example';
import {
  MchartLineCompactExample
} from '../_examples/mchart-line-compact-example/mchart-line-compact-example';
import {
  MchartLineWithMarkersExample
} from '../_examples/mchart-line-with-markers-example/mchart-line-with-markers-example';
import {
  MchartLineResponsiveExample
} from '../_examples/mchart-line-responsive-example/mchart-line-responsive-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    MchartLineWithTooltipExample,
    MchartLineBasicExample,
    MchartLineCustomCurveExample,
    MchartLineWithAreaExample,
    MchartLineCompactExample,
    MchartLineWithMarkersExample,
    MchartLineResponsiveExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
