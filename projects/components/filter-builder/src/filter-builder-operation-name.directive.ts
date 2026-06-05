import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsFilterBuilderOperationName]',
})
export class FilterBuilderOperationNameDirective {
  readonly templateRef = inject(TemplateRef);
}
