import { Component } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';

@Component({
  selector: 'app-menu-with-icons-example',
  imports: [
    Icon,
    Button,
    MenuTrigger,
    MenuItem,
    Menu
  ],
  templateUrl: './menu-with-icons-example.html',
  styleUrl: './menu-with-icons-example.scss'
})
export class MenuWithIconsExample {

}
