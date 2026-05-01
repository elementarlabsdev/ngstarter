import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ngsNavigationGroupToggleIcon]',
  exportAs: 'ngsNavigationGroupToggleIcon',
  host: {
    'class': 'ngs-navigation-group-toggle-icon'
  }
})
export class NavigationGroupToggleIconDirective {
  public readonly templateRef = inject(TemplateRef, { optional: true });
}
