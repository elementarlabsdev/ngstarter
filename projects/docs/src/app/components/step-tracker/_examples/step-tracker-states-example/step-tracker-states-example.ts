import { Component } from '@angular/core';
import {
  StepTracker,
  StepTrackerDescription,
  StepTrackerItem,
  StepTrackerLabel
} from '@ngstarter-ui/components/step-tracker';

@Component({
  selector: 'app-step-tracker-states-example',
  imports: [
    StepTracker,
    StepTrackerDescription,
    StepTrackerItem,
    StepTrackerLabel,
  ],
  templateUrl: './step-tracker-states-example.html',
})
export class StepTrackerStatesExample {}
