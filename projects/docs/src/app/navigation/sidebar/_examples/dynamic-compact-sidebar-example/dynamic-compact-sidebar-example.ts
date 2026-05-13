import { Component, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarNavItemIconDirective
} from '@ngstarter-ui/components/sidebar';
import {
  Sidenav,
  SidenavCollapsed,
  SidenavContainer,
  SidenavContent,
  SidenavExpanded
} from '@ngstarter-ui/components/sidenav';

@Component({
  selector: 'app-dynamic-compact-sidebar-example',
  imports: [
    Button,
    Icon,
    Sidebar,
    SidebarHeader,
    SidebarBody,
    SidebarFooter,
    SidebarNav,
    SidebarNavItem,
    SidebarNavItemIconDirective,
    Sidenav,
    SidenavCollapsed,
    SidenavContainer,
    SidenavContent,
    SidenavExpanded
  ],
  templateUrl: './dynamic-compact-sidebar-example.html'
})
export class DynamicCompactSidebarExample {
  compact = signal(true);

  navItems = [
    {
      key: 'home',
      label: 'Home',
      icon: 'fluent:home-24-regular'
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: 'fluent:chart-multiple-24-regular'
    },
    {
      key: 'team',
      label: 'Team',
      icon: 'fluent:people-team-24-regular'
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: 'fluent:settings-24-regular'
    }
  ];

  toggleCompact() {
    this.compact.update((compact) => !compact);
  }
}
