import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  LayoutContent,
  Layout,
  LayoutHeader,
  LayoutTopbar
} from '@ngstarter-ui/components/layout';
import { Announcement } from '@ngstarter-ui/components/announcement';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './layout-header-with-topbar-example.scss'
})
export class LayoutHeaderWithTopbarExample {

}
