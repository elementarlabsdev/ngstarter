import { Component } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { Kbd, KbdGroup } from '@ngstarter/components/kbd';
import { Icon } from '@ngstarter/components/icon';

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
