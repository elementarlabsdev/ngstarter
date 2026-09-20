import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  Navigation,
  NavigationHeading,
  NavigationItem
} from '@ngstarter-ui/components/navigation';

@Component({
  selector: 'app-navigation-with-heading-example',
  imports: [
    NavigationItem,
    NavigationHeading,
    Navigation
  ],
  templateUrl: './navigation-with-heading-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './navigation-with-heading-example.scss'
})
export class NavigationWithHeadingExample {

}
