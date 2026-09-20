import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  Navigation,
  NavigationGroup,
  NavigationGroupMenu,
  NavigationGroupToggle,
  NavigationItemBadgeDirective,
  NavigationItem
} from '@ngstarter-ui/components/navigation';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-navigation-with-badges-example',
  imports: [
    Icon,
    NavigationItemBadgeDirective,
    NavigationItem,
    NavigationGroupToggle,
    NavigationGroupMenu,
    NavigationGroup,
    Navigation
  ],
  templateUrl: './navigation-with-badges-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './navigation-with-badges-example.scss'
})
export class NavigationWithBadgesExample {

}
