import { Component } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { Menu, MenuHeading, MenuItem, MenuTrigger } from '@ngstarter/components/menu';

@Component({
  selector: 'app-menu-heading-example',
  imports: [
    Button,
    MenuTrigger,
    MenuItem,
    Menu,
    MenuHeading
  ],
  templateUrl: './menu-heading-example.html'
})
export class MenuHeadingExample {

}
