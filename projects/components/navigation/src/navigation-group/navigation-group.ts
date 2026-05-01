import { Component, forwardRef, signal } from '@angular/core';
import { NAVIGATION_GROUP } from '../types';

let nextId = 0;

@Component({
  selector: 'ngs-navigation-group',
  exportAs: 'ngsNavigationGroup',
  templateUrl: './navigation-group.html',
  styleUrl: './navigation-group.scss',
  providers: [
    {
      provide: NAVIGATION_GROUP,
      useExisting: forwardRef(() => NavigationGroup)
    }
  ],
  host: {
    'class': 'ngs-navigation-group'
  }
})
export class NavigationGroup {
  readonly key = signal(`ngs-navigation-group-${nextId++}`);
}
