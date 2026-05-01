import { Component } from '@angular/core';
import {
  Navigation,
  NavigationDivider,
  NavigationItem
} from '@ngstarter/components/navigation';

@Component({
  selector: 'app-navigation-with-divider-example',
  imports: [
    NavigationDivider,
    NavigationItem,
    Navigation
  ],
  templateUrl: './navigation-with-divider-example.html',
  styleUrl: './navigation-with-divider-example.scss'
})
export class NavigationWithDividerExample {

}
