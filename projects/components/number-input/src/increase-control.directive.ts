import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsIncreaseControl]',
  exportAs: 'ngsIncreaseControl'
})
export class IncreaseControlDirective {
  readonly templateRef = inject(TemplateRef);
}
