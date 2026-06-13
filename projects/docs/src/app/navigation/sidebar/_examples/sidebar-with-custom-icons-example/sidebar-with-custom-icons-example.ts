import { Component } from '@angular/core';
import { v7 as uuid } from 'uuid';
import {
  SidebarBody,
  Sidebar, SidebarDivider,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavGroup,
  SidebarNavGroupMenu,
  SidebarNavGroupToggle,
  SidebarNavGroupToggleIconDirective,
  SidebarHeading, SidebarNavItem,
  SidebarNavItemIconDirective
} from '@ngstarter-ui/components/sidebar';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-sidebar-with-custom-icons-example',
  imports: [
    Sidebar,
    SidebarHeader,
    SidebarNav,
    SidebarFooter,
    SidebarBody,
    SidebarNavItemIconDirective,
    Icon,
    SidebarNavGroup,
    SidebarNavGroupMenu,
    SidebarNavGroupToggle,
    SidebarNavGroupToggleIconDirective,
    SidebarHeading,
    SidebarNavItem,
    SidebarDivider
  ],
  templateUrl: './sidebar-with-custom-icons-example.html',
  styleUrl: './sidebar-with-custom-icons-example.scss'
})
export class SidebarWithCustomIconsExample {
  navItems: any[] = [
    {
      key: 'home',
      type: 'item',
      label: 'Home',
      icon: 'fluent:home-24-regular',
    },
    {
      key: 'account',
      type: 'item',
      label: 'Account',
      icon: 'fluent:person-24-regular',
    },
    {
      type: 'group',
      label: 'Nested Menu',
      icon: 'fluent:settings-24-regular',
      children: [
        {
          key: uuid(),
          type: 'item',
          label: 'Nested Item 1'
        },
        {
          key: uuid(),
          type: 'item',
          label: 'Nested Item 2'
        }
      ]
    },
  ];
}
