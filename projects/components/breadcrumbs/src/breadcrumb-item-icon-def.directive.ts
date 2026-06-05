import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsBreadcrumbItemIconDef]',
})
export class BreadcrumbItemIconDefDirective {
  readonly templateRef = inject(TemplateRef);
}
