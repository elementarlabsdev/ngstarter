import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsColorSchemeDark]'
})
export class ColorSchemeDarkDirective {
  readonly templateRef = inject(TemplateRef);
}
