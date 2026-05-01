import { Component } from '@angular/core';
import {
  LayoutContent,
  Layout, LayoutFooter,
  LayoutHeader,
  LayoutSidebar, LayoutTopbar
} from '@ngstarter-ui/components/layout';
import { Announcement } from '@ngstarter-ui/components/announcement';

@Component({
  selector: 'app-layout-with-nested-layouts-example',
  imports: [
    LayoutContent,
    Layout,
    LayoutHeader,
    LayoutSidebar,
    LayoutFooter,
    LayoutTopbar,
    Announcement
  ],
  templateUrl: './layout-with-nested-layouts-example.html',
  styleUrl: './layout-with-nested-layouts-example.scss'
})
export class LayoutWithNestedLayoutsExample {

}
