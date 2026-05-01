import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicSliderExample } from '../_examples/basic-slider-example/basic-slider-example';
import {
  CustomThumbLabelFormattingExample
} from '../_examples/custom-thumb-label-formatting-example/custom-thumb-label-formatting-example';
import { RangeSliderExample } from '../_examples/range-slider-example/range-slider-example';
import {
  ConfigurableSliderExample
} from '../_examples/configurable-slider-example/configurable-slider-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicSliderExample,
    CustomThumbLabelFormattingExample,
    RangeSliderExample,
    ConfigurableSliderExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
