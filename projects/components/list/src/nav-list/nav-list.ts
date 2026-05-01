import { Component, ChangeDetectionStrategy } from '@angular/core';
import { List } from '../list/list';

@Component({
  selector: 'ngs-nav-list',
  exportAs: 'ngsNavList',
  templateUrl: './nav-list.html',
  styleUrl: './nav-list.scss',
  host: {
    'class': 'ngs-nav-list',
    'role': 'navigation',
    '[attr.aria-disabled]': 'disabled()',
  },
  providers: [
    { provide: List, useExisting: NavList }
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavList extends List {
}
