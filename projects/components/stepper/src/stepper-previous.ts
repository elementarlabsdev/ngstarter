import { Directive, input } from '@angular/core';
import { CdkStepperPrevious } from '@angular/cdk/stepper';

@Directive({
  selector: 'button[ngsStepperPrevious]',
  host: {
    '[type]': 'type',
  },
  standalone: true
})
export class StepperPrevious extends CdkStepperPrevious {
  override type: string = 'button';
}
