import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LayoutContent, Layout, LayoutSidebar } from '@ngstarter-ui/components/layout';

@Component({
  selector: 'app-layout-sidebar-example',
  imports: [
    LayoutContent,
    Layout,
    LayoutSidebar
  ],
  templateUrl: './layout-sidebar-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './layout-sidebar-example.scss'
})
export class LayoutSidebarExample {

}
