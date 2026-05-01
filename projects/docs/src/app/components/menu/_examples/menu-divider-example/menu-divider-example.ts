import { Component } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { Menu, MenuItem, MenuTrigger, MenuDivider } from '@ngstarter/components/menu';

@Component({
  selector: 'app-menu-divider-example',
  imports: [
    Button,
    MenuTrigger,
    MenuItem,
    Menu,
    MenuDivider
  ],
  templateUrl: './menu-divider-example.html'
})
export class MenuDividerExample {

}
