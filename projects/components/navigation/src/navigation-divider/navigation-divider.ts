import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-navigation-divider',
  exportAs: 'ngsNavigationDivider',
  template: '',
  styleUrl: './navigation-divider.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-navigation-divider'
  }
})
export class NavigationDivider {
}
