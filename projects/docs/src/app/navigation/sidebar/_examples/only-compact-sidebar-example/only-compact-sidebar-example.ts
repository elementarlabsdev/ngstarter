import { Component } from '@angular/core';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarNavItemIconDirective
} from '@ngstarter-ui/components/sidebar';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-only-compact-sidebar-example',
  imports: [
    Sidebar,
    SidebarHeader,
    SidebarBody,
    SidebarFooter,
    SidebarNav,
    SidebarNavItem,
    SidebarNavItemIconDirective,
    Icon
  ],
  templateUrl: './only-compact-sidebar-example.html'
})
export class OnlyCompactSidebarExample {
  navItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'fluent:grid-24-regular'
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: 'fluent:data-bar-vertical-24-regular'
    },
    {
      key: 'inbox',
      label: 'Inbox',
      icon: 'fluent:mail-24-regular'
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: 'fluent:settings-24-regular'
    }
  ];
}
