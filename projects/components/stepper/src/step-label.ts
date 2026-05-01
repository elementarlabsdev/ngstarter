import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsStepLabel]',
  standalone: true
})
export class StepLabel {
  constructor(public template: TemplateRef<any>) { }
}
