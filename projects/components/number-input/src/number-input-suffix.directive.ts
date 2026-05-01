import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsNumberInputSuffix]',
  exportAs: 'ngsNumberInputSuffix'
})
export class NumberInputSuffixDirective {
  readonly templateRef = inject(TemplateRef);
}
