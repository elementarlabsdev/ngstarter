import { Component } from '@angular/core';
import { Drawer } from '@ngstarter-ui/components/drawer';
import { Button } from '@ngstarter-ui/components/button';
import {
  PanelContent,
  Panel,
  PanelFooter,
  PanelHeader
} from '@ngstarter-ui/components/panel';

@Component({
  selector: 'app-drawer-without-backdrop-example',
  imports: [
    Drawer,
    Button,
    PanelContent,
    Panel,
    PanelFooter,
    PanelHeader
  ],
  templateUrl: './drawer-without-backdrop-example.html',
  styleUrl: './drawer-without-backdrop-example.scss'
})
export class DrawerWithoutBackdropExample {

}
