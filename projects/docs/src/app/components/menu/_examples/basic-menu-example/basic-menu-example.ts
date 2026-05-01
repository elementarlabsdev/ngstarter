import { Component } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';

@Component({
  selector: 'app-basic-menu-example',
  imports: [
    Button,
    MenuTrigger,
    MenuItem,
    Menu
  ],
  templateUrl: './basic-menu-example.html',
  styleUrl: './basic-menu-example.scss'
})
export class BasicMenuExample {

}
