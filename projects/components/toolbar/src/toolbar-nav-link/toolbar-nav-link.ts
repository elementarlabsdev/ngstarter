import { Component, input } from '@angular/core';

@Component({
  selector: 'ngs-toolbar-nav-link,a[ngs-toolbar-nav-link]',
  exportAs: 'ngsToolbarNavLink',
  standalone: true,
  template: '<ng-content />',
  imports: [],
  styleUrl: './toolbar-nav-link.scss',
  host: {
    'class': 'ngs-toolbar-nav-link',
    '[class.ngs-toolbar-nav-link-active]': 'active()',
  }
})
export class ToolbarNavLink {
  /** The active state of the link. */
  readonly active = input(false);
}
