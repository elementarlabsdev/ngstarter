import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsBreadcrumbItemIconDef]',
  standalone: true
})
export class BreadcrumbItemIconDefDirective {
  readonly templateRef = inject(TemplateRef);
}
