import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsFilterBuilderOperationName]',
  standalone: true
})
export class FilterBuilderOperationNameDirective {
  readonly templateRef = inject(TemplateRef);
}
