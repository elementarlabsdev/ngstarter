import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicTooltipExample } from '../_examples/basic-tooltip-example/basic-tooltip-example';
import {
  TooltipWithACustomPositionExample
} from '../_examples/tooltip-with-a-custom-position-example/tooltip-with-a-custom-position-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import {
  TooltipShowHideDelayExample
} from '../_examples/tooltip-show-hide-delay-example/tooltip-show-hide-delay-example';
import {
  TooltipManuallyShowHideExample
} from '../_examples/tooltip-manually-show-hide-example/tooltip-manually-show-hide-example';
import { TooltipDisabledExample } from '../_examples/tooltip-disabled-example/tooltip-disabled-example';
import {
  TooltipPositionAtOriginExample
} from '../_examples/tooltip-position-at-origin-example/tooltip-position-at-origin-example';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicTooltipExample,
    TooltipWithACustomPositionExample,
    Page,
    PageContentDirective,
    PageTitleDirective,
    TooltipShowHideDelayExample,
    TooltipManuallyShowHideExample,
    TooltipDisabledExample,
    TooltipPositionAtOriginExample
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
