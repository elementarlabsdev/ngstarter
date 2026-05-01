import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import {
  Navigation,
  NavigationItem,
  NavigationItemIconDirective
} from '@ngstarter/components/navigation';

@Component({
  selector: 'app-navigation-with-icons-example',
  imports: [
    Icon,
    NavigationItemIconDirective,
    NavigationItem,
    Navigation,
  ],
  templateUrl: './navigation-with-icons-example.html',
  styleUrl: './navigation-with-icons-example.scss'
})
export class NavigationWithIconsExample {

}
