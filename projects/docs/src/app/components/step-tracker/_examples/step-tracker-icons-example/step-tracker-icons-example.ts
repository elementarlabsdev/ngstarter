import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  StepTracker,
  StepTrackerCompletedIcon,
  StepTrackerErrorIcon,
  StepTrackerItem
} from '@ngstarter-ui/components/step-tracker';

@Component({
  selector: 'app-step-tracker-icons-example',
  imports: [
    Icon,
    StepTracker,
    StepTrackerCompletedIcon,
    StepTrackerErrorIcon,
    StepTrackerItem,
  ],
  templateUrl: './step-tracker-icons-example.html',
})
export class StepTrackerIconsExample {}
