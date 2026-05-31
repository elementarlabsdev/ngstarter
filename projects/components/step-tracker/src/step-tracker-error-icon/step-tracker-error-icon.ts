import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[ngsStepTrackerErrorIcon]',
  exportAs: 'ngsStepTrackerErrorIcon',
})
export class StepTrackerErrorIcon {
  readonly templateRef = inject(TemplateRef);
}
