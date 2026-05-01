import { Component } from '@angular/core';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-nested-menu-example',
  imports: [
    MenuTrigger,
    MenuItem,
    Menu,
    Button
  ],
  templateUrl: './nested-menu-example.html',
  styleUrl: './nested-menu-example.scss'
})
export class NestedMenuExample {

}
