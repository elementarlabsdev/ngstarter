import { Component } from '@angular/core';
import {
  Navigation,
  NavigationGroup,
  NavigationGroupMenu,
  NavigationGroupToggle,
  NavigationItemBadgeDirective,
  NavigationItem
} from '@ngstarter/components/navigation';
import { Icon } from '@ngstarter/components/icon';

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
  styleUrl: './navigation-with-badges-example.scss'
})
export class NavigationWithBadgesExample {

}
