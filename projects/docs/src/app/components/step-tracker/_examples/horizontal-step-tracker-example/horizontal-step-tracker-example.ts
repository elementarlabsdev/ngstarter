import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  StepTracker,
  StepTrackerItem
} from '@ngstarter-ui/components/step-tracker';

@Component({
  selector: 'app-horizontal-step-tracker-example',
  imports: [
    StepTracker,
    StepTrackerItem,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './horizontal-step-tracker-example.html',
})
export class HorizontalStepTrackerExample {}
