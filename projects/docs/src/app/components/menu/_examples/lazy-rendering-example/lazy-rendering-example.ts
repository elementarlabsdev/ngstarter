import { Component } from '@angular/core';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';

@Component({
  selector: 'app-lazy-rendering-example',
  imports: [
    Menu,
    MenuContent,
    MenuItem,
    Icon,
    Button,
    MenuTrigger
  ],
  templateUrl: './lazy-rendering-example.html',
  styleUrl: './lazy-rendering-example.scss',
})
export class LazyRenderingExample {

}
