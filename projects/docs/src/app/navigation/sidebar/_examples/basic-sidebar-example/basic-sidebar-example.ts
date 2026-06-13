import { Component } from '@angular/core';
import {
  SidebarBody,
  Sidebar,
  SidebarDivider,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavGroup,
  SidebarNavGroupMenu,
  SidebarNavGroupToggle,
  SidebarHeading,
  SidebarNavItem,
  SidebarNavItemIconDirective,
  SidebarNavGroupToggleIconDirective,
  SidebarSpacer
} from '@ngstarter-ui/components/sidebar';
import { v7 as uuid } from 'uuid';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-basic-sidebar-example',
  imports: [
    Sidebar,
    SidebarHeader,
    SidebarNav,
    SidebarFooter,
    SidebarBody,
    SidebarNavItem,
    SidebarNavItemIconDirective,
    Icon,
    SidebarNavGroup,
    SidebarNavGroupMenu,
    SidebarNavGroupToggle,
    SidebarNavGroupToggleIconDirective,
    SidebarHeading,
    SidebarDivider,
    SidebarSpacer,
  ],
  templateUrl: './basic-sidebar-example.html',
  styleUrl: './basic-sidebar-example.scss'
})
export class BasicSidebarExample {
  navItems: any[] = [
    {
      key: 'home',
      type: 'item',
      label: 'Home'
    },
    {
      key: 'account',
      type: 'item',
      label: 'Account'
    },
    {
      type: 'divider',
    },
    {
      type: 'group',
      label: 'Nested Menu',
      icon: 'options-24-regular',
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
    {
      type: 'spacer',
    },
    {
      type: 'heading',
      label: 'Overview'
    },
    {
      key: 'item1',
      type: 'item',
      label: 'Item 1'
    },
    {
      key: 'item2',
      type: 'item',
      label: 'Item 2'
    },
  ];
}
