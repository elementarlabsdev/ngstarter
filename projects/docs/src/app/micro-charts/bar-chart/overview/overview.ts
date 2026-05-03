import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  MchartBarBasicExample
} from '../_examples/mchart-bar-basic-example/mchart-bar-basic-example';
import {
  MchartBarCustomRadiusExample
} from '../_examples/mchart-bar-custom-radius-example/mchart-bar-custom-radius-example';
import {
  MchartBarWithBarHighlightExample
} from '../_examples/mchart-bar-with-bar-highlight-example/mchart-bar-with-bar-highlight-example';
import {
  MchartBarResponsiveExample
} from '../_examples/mchart-bar-responsive-example/mchart-bar-responsive-example';
import {
  MchartBarFillGradientExample
} from '../_examples/mchart-bar-fill-gradient-example/mchart-bar-fill-gradient-example';
import {
  MchartBarWithTooltipExample
} from '../_examples/mchart-bar-with-tooltip-example/mchart-bar-with-tooltip-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    MchartBarBasicExample,
    MchartBarCustomRadiusExample,
    MchartBarWithBarHighlightExample,
    MchartBarResponsiveExample,
    MchartBarFillGradientExample,
    MchartBarWithTooltipExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
