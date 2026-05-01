import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsBreadcrumbItemTitleDef]'
})
export class BreadcrumbItemTitleDefDirective {
  readonly templateRef = inject(TemplateRef);
}
