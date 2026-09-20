import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngs-navigation-heading',
  exportAs: 'ngsNavigationHeading',
  templateUrl: './navigation-heading.html',
  styleUrl: './navigation-heading.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    'class': 'ngs-navigation-heading'
  }
})
export class NavigationHeading {
}
