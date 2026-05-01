import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsNumberInputPrefix]',
  exportAs: 'ngsNumberInputPrefix'
})
export class NumberInputPrefixDirective {
  readonly templateRef = inject(TemplateRef);
}
