import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsFilterBuilderOperationIcon]',
  standalone: true
})
export class FilterBuilderOperationIconDirective {
  readonly templateRef = inject(TemplateRef);
}
