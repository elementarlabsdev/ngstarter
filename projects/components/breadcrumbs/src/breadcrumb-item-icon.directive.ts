import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsBreadcrumbItemIcon]',
  exportAs: 'ngsBreadcrumbItemIcon',
  host: {
    'class': 'ngs-breadcrumb-item-icon'
  }
})
export class BreadcrumbItemIconDirective {
}
