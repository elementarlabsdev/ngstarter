import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsDecreaseControl]',
  exportAs: 'ngsDecreaseControl'
})
export class DecreaseControlDirective {
  readonly templateRef = inject(TemplateRef);
}
