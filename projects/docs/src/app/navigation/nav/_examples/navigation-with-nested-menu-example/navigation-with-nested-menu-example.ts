import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  Navigation,
  NavigationGroup, NavigationGroupMenu, NavigationGroupToggle,
  NavigationGroupToggleIconDirective,
  NavigationItem
} from '@ngstarter-ui/components/navigation';

@Component({
  selector: 'app-navigation-with-nested-menu-example',
  imports: [
    Icon,
    NavigationItem,
    NavigationGroup,
    NavigationGroupToggleIconDirective,
    Navigation,
    NavigationGroupToggle,
    NavigationGroupMenu
  ],
  templateUrl: './navigation-with-nested-menu-example.html',
  styleUrl: './navigation-with-nested-menu-example.scss'
})
export class NavigationWithNestedMenuExample {

}
