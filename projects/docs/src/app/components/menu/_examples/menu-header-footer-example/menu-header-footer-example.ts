import { Component } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { Menu, MenuFooter, MenuHeader, MenuItem, MenuTrigger } from '@ngstarter/components/menu';

@Component({
  selector: 'app-menu-header-footer-example',
  imports: [
    Button,
    MenuTrigger,
    MenuItem,
    Menu,
    MenuHeader,
    MenuFooter
  ],
  templateUrl: './menu-header-footer-example.html',
  styleUrl: './menu-header-footer-example.scss'
})
export class MenuHeaderFooterExample {

}
