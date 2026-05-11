import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsColorSchemeAuto]'
})
export class ColorSchemeAutoDirective {
  readonly templateRef = inject(TemplateRef);
}
