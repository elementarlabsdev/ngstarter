import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsStepTrackerCompletedIcon]',
  exportAs: 'ngsStepTrackerCompletedIcon',
})
export class StepTrackerCompletedIcon {
  readonly templateRef = inject(TemplateRef);
}
