import { Component, contentChild, ChangeDetectionStrategy } from '@angular/core';
import { CdkStep } from '@angular/cdk/stepper';
import { StepLabel } from '../step-label';

@Component({
  selector: 'ngs-step',
  exportAs: 'ngsStep',
  templateUrl: './step.html',
  styleUrl: './step.scss',
  providers: [
    {
      provide: CdkStep,
      useExisting: Step
    }
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-step'
  }
})
export class Step extends CdkStep {
  readonly ngsStepLabel = contentChild(StepLabel);
}
