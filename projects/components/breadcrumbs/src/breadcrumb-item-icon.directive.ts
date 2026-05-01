import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsBreadcrumbItemIcon]',
  exportAs: 'ngsBreadcrumbItemIcon',
  standalone: true,
  host: {
    'class': 'ngs-breadcrumb-item-icon'
  }
})
export class BreadcrumbItemIconDirective {
}
