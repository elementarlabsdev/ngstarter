import { Component } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { Drawer } from '@ngstarter/components/drawer';
import {
  PanelContent,
  Panel,
  PanelFooter,
  PanelHeader
} from '@ngstarter/components/panel';

@Component({
  selector: 'app-basic-drawer-example',
  imports: [
    Button,
    Drawer,
    Panel,
    PanelHeader,
    PanelContent,
    PanelFooter
  ],
  templateUrl: './basic-drawer-example.html',
  styleUrl: './basic-drawer-example.scss'
})
export class BasicDrawerExample {

}
