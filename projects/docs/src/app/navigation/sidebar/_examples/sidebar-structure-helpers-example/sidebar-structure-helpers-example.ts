import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  Sidebar,
  SidebarBody,
  SidebarDivider,
  SidebarHeading,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarSpacer,
} from '@ngstarter-ui/components/sidebar';

@Component({
  selector: 'app-sidebar-structure-helpers-example',
  imports: [
    Sidebar,
    SidebarHeader,
    SidebarBody,
    SidebarNav,
    SidebarHeading,
    SidebarNavItem,
    SidebarDivider,
    SidebarSpacer
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './sidebar-structure-helpers-example.html',
})
export class SidebarStructureHelpersExample {
}
