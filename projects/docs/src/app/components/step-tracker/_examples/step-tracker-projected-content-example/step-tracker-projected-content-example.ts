import { Component } from '@angular/core';
import {
  StepTracker,
  StepTrackerDescription,
  StepTrackerItem,
  StepTrackerLabel
} from '@ngstarter-ui/components/step-tracker';

@Component({
  selector: 'app-step-tracker-projected-content-example',
  imports: [
    StepTracker,
    StepTrackerDescription,
    StepTrackerItem,
    StepTrackerLabel,
  ],
  templateUrl: './step-tracker-projected-content-example.html',
})
export class StepTrackerProjectedContentExample {}
