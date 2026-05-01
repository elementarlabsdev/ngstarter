import { Component } from '@angular/core';
import {
  LayoutAside,
  LayoutContent,
  Layout,
  LayoutSidebar
} from '@ngstarter/components/layout';

@Component({
  selector: 'app-layout-aside-example',
  imports: [
    LayoutContent,
    Layout,
    LayoutSidebar,
    LayoutAside
  ],
  templateUrl: './layout-aside-example.html',
  styleUrl: './layout-aside-example.scss'
})
export class LayoutAsideExample {

}
