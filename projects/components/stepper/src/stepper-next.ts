import { Directive, input } from '@angular/core';
import { CdkStepperNext } from '@angular/cdk/stepper';

@Directive({
  selector: 'button[ngsStepperNext]',
  host: {
    '[type]': 'type',
  },
  standalone: true
})
export class StepperNext extends CdkStepperNext {
  override type: string = 'submit';
}
