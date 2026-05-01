import { Directive } from '@angular/core';

@Directive({
  selector: '[ngsNavigationItemBadge]',
  exportAs: 'ngsNavigationItemBadge',
  standalone: true,
  host: {
    'class': 'ngs-navigation-item-badge',
  }
})
export class NavigationItemBadgeDirective {
}
