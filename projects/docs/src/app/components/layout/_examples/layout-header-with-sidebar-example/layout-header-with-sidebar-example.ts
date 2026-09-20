import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  LayoutContent,
  Layout,
  LayoutHeader,
  LayoutSidebar
} from '@ngstarter-ui/components/layout';

@Component({
  selector: 'app-layout-header-with-sidebar-example',
  imports: [
    LayoutContent,
    Layout,
    LayoutHeader,
    LayoutSidebar
  ],
  templateUrl: './layout-header-with-sidebar-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './layout-header-with-sidebar-example.scss'
})
export class LayoutHeaderWithSidebarExample {

}
