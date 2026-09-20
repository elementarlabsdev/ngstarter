import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { RailNav, RailNavItem } from '@ngstarter-ui/components/rail-nav';

@Component({
  selector: 'app-rail-nav-customization-example',
  imports: [
    Icon,
    RailNav,
    RailNavItem
  ],
  templateUrl: './rail-nav-customization-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './rail-nav-customization-example.scss'
})
export class RailNavCustomizationExample {

}
