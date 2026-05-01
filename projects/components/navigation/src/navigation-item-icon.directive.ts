import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsNavigationItemIcon]',
  exportAs: 'ngsNavigationItemIcon',
  host: {
    'class': 'ngs-navigation-item-icon'
  }
})
export class NavigationItemIconDirective {
  public readonly templateRef = inject(TemplateRef, { optional: true });
}
