import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-menu-positioning-example',
  imports: [
    Menu,
    MenuItem,
    MenuTrigger,
    Button
  ],
  templateUrl: './menu-positioning-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './menu-positioning-example.scss'
})
export class MenuPositioningExample {

}
