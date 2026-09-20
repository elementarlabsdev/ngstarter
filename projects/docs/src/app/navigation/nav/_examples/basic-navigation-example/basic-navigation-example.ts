import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Navigation, NavigationItem } from '@ngstarter-ui/components/navigation';

@Component({
  selector: 'app-basic-navigation-example',
  imports: [
    NavigationItem,
    Navigation
  ],
  templateUrl: './basic-navigation-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-navigation-example.scss'
})
export class BasicNavigationExample {

}
