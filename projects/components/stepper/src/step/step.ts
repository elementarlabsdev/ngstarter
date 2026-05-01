import { Component, ContentChild, Input, ViewEncapsulation, forwardRef, Inject } from '@angular/core';
import { CdkStep, CdkStepper } from '@angular/cdk/stepper';
import { StepLabel } from '../step-label';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

import { Stepper } from '../stepper/stepper';

@Component({
  selector: 'ngs-step',
  exportAs: 'ngsStep',
  standalone: true,
  imports: [],
  templateUrl: './step.html',
  styleUrl: './step.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: CdkStep, useExisting: Step }],
})
export class Step extends CdkStep {
  @ContentChild(StepLabel) override stepLabel: StepLabel = undefined!;

  constructor(@Inject(forwardRef(() => Stepper)) stepper: Stepper) {
    super(stepper);
  }
}
