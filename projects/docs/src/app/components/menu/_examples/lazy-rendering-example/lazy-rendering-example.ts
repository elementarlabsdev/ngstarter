import { Component } from '@angular/core';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';

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
