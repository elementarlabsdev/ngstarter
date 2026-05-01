import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
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
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-overview',
  imports: [
    Page,
    PageContentDirective,
    Playground,
    MchartPieBasicExample,
    MchartPieWithLegendExample,
    MchartPieValueOnSlicesExample,
    MchartPieWithTooltipExample,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
