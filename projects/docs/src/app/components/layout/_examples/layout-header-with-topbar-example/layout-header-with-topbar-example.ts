import { Component } from '@angular/core';
import {
  LayoutContent,
  Layout,
  LayoutHeader,
  LayoutTopbar
} from '@ngstarter/components/layout';
import { Announcement } from '@ngstarter/components/announcement';

@Component({
  selector: 'app-layout-header-with-topbar-example',
  imports: [
    LayoutContent,
    Layout,
    LayoutHeader,
    LayoutTopbar,
    Announcement
  ],
  templateUrl: './layout-header-with-topbar-example.html',
  styleUrl: './layout-header-with-topbar-example.scss'
})
export class LayoutHeaderWithTopbarExample {

}
