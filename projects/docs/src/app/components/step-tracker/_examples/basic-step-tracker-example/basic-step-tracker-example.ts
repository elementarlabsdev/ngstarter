import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  StepTracker,
  StepTrackerItem
} from '@ngstarter-ui/components/step-tracker';

@Component({
  selector: 'app-basic-step-tracker-example',
  imports: [
    Button,
    StepTracker,
    StepTrackerItem,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './basic-step-tracker-example.html',
})
export class BasicStepTrackerExample {
  activeIndex = signal(1);

  previousStep() {
    this.activeIndex.update((index) => Math.max(index - 1, 0));
  }

  nextStep() {
    this.activeIndex.update((index) => Math.min(index + 1, 5));
  }
}
