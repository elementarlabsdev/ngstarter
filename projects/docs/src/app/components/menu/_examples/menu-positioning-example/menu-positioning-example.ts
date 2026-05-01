import { Component } from '@angular/core';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-menu-positioning-example',
  imports: [
    Menu,
    MenuItem,
    MenuTrigger,
    Button
  ],
  templateUrl: './menu-positioning-example.html',
  styleUrl: './menu-positioning-example.scss'
})
export class MenuPositioningExample {

}
