import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicStepperExample } from '../_examples/basic-stepper-example/basic-stepper-example';
import {
  StepperVerticalExample
} from '../_examples/stepper-vertical-example/stepper-vertical-example';
import {
  StepperHeaderPositionExample
} from '../_examples/stepper-header-position-example/stepper-header-position-example';
import {
  StepperWithErrorsStateExample
} from '../_examples/stepper-with-errors-state-example/stepper-with-errors-state-example';
import {
  StepperResponsiveExample
} from '../_examples/stepper-responsive-example/stepper-responsive-example';
import {
  StepperLabelBottomPositionExample
} from '../_examples/stepper-label-bottom-position-example/stepper-label-bottom-position-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicStepperExample,
    StepperVerticalExample,
    StepperHeaderPositionExample,
    StepperWithErrorsStateExample,
    StepperResponsiveExample,
    StepperLabelBottomPositionExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
