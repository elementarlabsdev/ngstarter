import { Component } from '@angular/core';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { Button } from '@ngstarter-ui/components/button';

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
