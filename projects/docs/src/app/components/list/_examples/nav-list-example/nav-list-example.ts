import { Component } from '@angular/core';
import { NavList, ListItem, ListItemIcon } from '@ngstarter/components/list';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'app-nav-list-example',
  standalone: true,
  imports: [
    NavList,
    ListItem,
    ListItemIcon,
    Icon
  ],
  templateUrl: './nav-list-example.html',
})
export class NavListExample {
}
