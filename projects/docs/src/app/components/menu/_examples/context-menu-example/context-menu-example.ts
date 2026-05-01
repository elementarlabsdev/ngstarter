import { Component } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Menu, MenuItem, ContextMenuTrigger } from '@ngstarter-ui/components/menu';

@Component({
  selector: 'app-context-menu-example',
  imports: [
    Icon,
    Menu,
    MenuItem,
    ContextMenuTrigger
  ],
  templateUrl: './context-menu-example.html',
  styleUrl: './context-menu-example.scss'
})
export class ContextMenuExample {

}
