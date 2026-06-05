import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsFilterBuilderOperationIcon]',
})
export class FilterBuilderOperationIconDirective {
  readonly templateRef = inject(TemplateRef);
}
