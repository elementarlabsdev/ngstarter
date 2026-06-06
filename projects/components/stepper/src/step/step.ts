import { Component, contentChild, forwardRef, Inject } from '@angular/core';
import { CdkStep } from '@angular/cdk/stepper';
import { StepLabel } from '../step-label';
import { Stepper } from '../stepper/stepper';

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
  host: {
    'class': 'ngs-step'
  }
})
export class Step extends CdkStep {
  readonly ngsStepLabel = contentChild(StepLabel);

  constructor(@Inject(forwardRef(() => Stepper)) stepper: Stepper) {
    super(stepper);
  }
}
