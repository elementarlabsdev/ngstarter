import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicStepTrackerExample
} from '../_examples/basic-step-tracker-example/basic-step-tracker-example';
import {
  StepTrackerStatesExample
} from '../_examples/step-tracker-states-example/step-tracker-states-example';
import {
  StepTrackerProjectedContentExample
} from '../_examples/step-tracker-projected-content-example/step-tracker-projected-content-example';
import {
  HorizontalStepTrackerExample
} from '../_examples/horizontal-step-tracker-example/horizontal-step-tracker-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicStepTrackerExample,
    HorizontalStepTrackerExample,
    StepTrackerProjectedContentExample,
    StepTrackerStatesExample,
  ],
  templateUrl: './overview.html',
})
export class Overview {}
