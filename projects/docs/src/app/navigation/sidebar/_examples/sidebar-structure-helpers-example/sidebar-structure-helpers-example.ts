import { Component } from '@angular/core';
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
  templateUrl: './sidebar-structure-helpers-example.html',
})
export class SidebarStructureHelpersExample {
}
