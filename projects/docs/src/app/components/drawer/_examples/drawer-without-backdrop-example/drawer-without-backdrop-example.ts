import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Drawer } from '@ngstarter-ui/components/drawer';
import { Button } from '@ngstarter-ui/components/button';
import {
  LayoutContent,
  Layout,
  LayoutFooter,
  LayoutHeader
} from '@ngstarter-ui/components/layout';

@Component({
  selector: 'app-drawer-without-backdrop-example',
  imports: [
    Drawer,
    Button,
    LayoutContent,
    Layout,
    LayoutFooter,
    LayoutHeader
  ],
  templateUrl: './drawer-without-backdrop-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './drawer-without-backdrop-example.scss'
})
export class DrawerWithoutBackdropExample {

}
