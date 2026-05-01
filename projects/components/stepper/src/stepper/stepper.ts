import { Component, input, ViewEncapsulation, contentChildren } from '@angular/core';
import { CdkStepper, StepperOrientation } from '@angular/cdk/stepper';
import { Step } from '../step/step';
import { StepLabel } from '../step-label';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngs-stepper',
  exportAs: 'ngsStepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.html',
  styleUrl: './stepper.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: CdkStepper, useExisting: Stepper }],
})
export class Stepper extends CdkStepper {
  headerPosition = input<'top' | 'bottom'>('top');
  labelPosition = input<'top' | 'bottom'>('top');

  private _stepperOrientation: StepperOrientation = 'horizontal';

  override get orientation(): StepperOrientation {
    return this._stepperOrientation;
  }
  override set orientation(value: StepperOrientation) {
    this._stepperOrientation = value;
  }

  // Use a separate signal for template iteration to avoid overriding CdkStepper's QueryList `_steps`.
  readonly stepItems = contentChildren(Step, { descendants: true });
  readonly _stepLabels = contentChildren(StepLabel, { descendants: true });

  override ngAfterContentInit() {
    super.ngAfterContentInit();
  }
}
