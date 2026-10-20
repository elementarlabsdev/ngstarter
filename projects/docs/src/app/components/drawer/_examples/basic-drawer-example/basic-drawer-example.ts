import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Drawer } from '@ngstarter-ui/components/drawer';
import {
  LayoutContent,
  Layout,
  LayoutFooter,
  LayoutHeader
} from '@ngstarter-ui/components/layout';

@Component({
  selector: 'app-basic-drawer-example',
  imports: [
    Button,
    Drawer,
    Layout,
    LayoutHeader,
    LayoutContent,
    LayoutFooter
  ],
  templateUrl: './basic-drawer-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-drawer-example.scss'
})
export class BasicDrawerExample {

}
