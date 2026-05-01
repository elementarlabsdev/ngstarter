import { Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { Kbd, KbdGroup } from '@ngstarter-ui/components/kbd';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-kbd-with-menu-example',
  imports: [
    Button,
    Menu,
    MenuItem,
    MenuTrigger,
    Kbd,
    KbdGroup,
    Icon
  ],
  templateUrl: './kbd-with-menu-example.html',
  styleUrl: './kbd-with-menu-example.scss',
})
export class KbdWithMenuExample {

}
