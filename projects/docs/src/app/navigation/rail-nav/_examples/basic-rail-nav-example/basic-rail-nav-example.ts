import { Component } from '@angular/core';
import { RailNav, RailNavItem } from '@ngstarter-ui/components/rail-nav';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-basic-rail-nav-example',
  imports: [
    RailNav,
    RailNavItem,
    Icon
  ],
  templateUrl: './basic-rail-nav-example.html',
  styleUrl: './basic-rail-nav-example.scss'
})
export class BasicRailNavExample {

}
