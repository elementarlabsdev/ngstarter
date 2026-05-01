import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsBreadcrumbItemNameDef]'
})
export class BreadcrumbItemNameDefDirective {
  readonly templateRef = inject(TemplateRef);
}
