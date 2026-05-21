import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, IconButtonSuffix, IconPrefix, Label } from '@ngstarter-ui/components/form-field';
import { Grid, GridItem, GridItemConfig } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { Layout, LayoutContent } from '@ngstarter-ui/components/layout';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavGroup,
  SidebarNavGroupMenu,
  SidebarNavGroupToggle,
  SidebarNavGroupToggleIconDirective,
  SidebarNavHeading,
  SidebarNavItem,
  SidebarNavItemBadgeDirective,
  SidebarNavItemIconDirective,
} from '@ngstarter-ui/components/sidebar';
import { Sidenav, SidenavContainer, SidenavContent } from '@ngstarter-ui/components/sidenav';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Toolbar, ToolbarItem, ToolbarSpacer, ToolbarTitle } from '@ngstarter-ui/components/toolbar';

interface NavItem {
  readonly key: string;
  readonly label: string;
  readonly icon: string;
  readonly badge?: string;
}

interface NavSection {
  readonly label?: string;
  readonly items: readonly NavItem[];
}

@Component({
  selector: 'app-root',
  imports: [
    Avatar,
    Button,
    FormField,
    Grid,
    Icon,
    IconButtonSuffix,
    IconPrefix,
    Input,
    Label,
    Layout,
    LayoutContent,
    Panel,
    PanelContent,
    PanelHeader,
    ScrollbarArea,
    Sidebar,
    SidebarBody,
    SidebarFooter,
    SidebarHeader,
    SidebarNav,
    SidebarNavGroup,
    SidebarNavGroupMenu,
    SidebarNavGroupToggle,
    SidebarNavGroupToggleIconDirective,
    SidebarNavHeading,
    SidebarNavItem,
    SidebarNavItemBadgeDirective,
    SidebarNavItemIconDirective,
    Sidenav,
    SidenavContainer,
    SidenavContent,
    Toolbar,
    ToolbarItem,
    ToolbarSpacer,
    ToolbarTitle,
    Tooltip,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly search = signal('');

  protected readonly dashboardSections = signal<readonly NavSection[]>([
    {
      label: 'My Templates',
      items: [
        { key: 'hourly', label: 'Store Analytics - Hourly', icon: 'fluent:clock-24-regular' },
        {
          key: 'realtime',
          label: 'Store Analytics - Realtime',
          icon: 'fluent:chart-multiple-24-regular',
        },
      ],
    },
    {
      label: 'General Templates',
      items: [
        { key: 'security-events', label: 'Security Events & Feed', icon: 'fluent:apps-list-24-regular' },
        { key: 'marketing', label: 'Marketing Insights', icon: 'fluent:apps-list-24-regular' },
        { key: 'visits', label: 'Analysis of visits', icon: 'fluent:apps-list-24-regular' },
        { key: 'purchases', label: 'Purchases of goods', icon: 'fluent:apps-list-24-regular' },
        { key: 'security-dept', label: 'Security department', icon: 'fluent:apps-list-24-regular' },
      ],
    },
  ]);

  protected readonly organizationItems = signal<readonly NavItem[]>([
    { key: 'teams', label: 'Team structure', icon: 'fluent:people-team-24-regular' },
    { key: 'locations', label: 'Store locations', icon: 'fluent:location-24-regular' },
    { key: 'access', label: 'Access roles', icon: 'fluent:key-24-regular' },
  ]);

  protected readonly footerItems = signal<readonly NavItem[]>([
    { key: 'insights', label: 'Insights', icon: 'fluent:lightbulb-24-regular' },
  ]);

  protected readonly dashboardGridConfigs = signal<GridItemConfig[]>([
    {
      type: 'analytics-widget',
      plain: true,
      component: () =>
        import('./modern-dashboard-widget').then((module) => module.ModernDashboardWidget),
    },
  ]);

  protected readonly dashboardGridItems = signal<GridItem[]>([
    {
      id: 'zone-map',
      type: 'analytics-widget',
      columns: 4,
      height: '405px',
      content: {
        kind: 'map',
        title: 'Live floor signals',
        subtitle: 'Zone activity from the last ten minutes',
      },
    },
    {
      id: 'conversion-pulse',
      type: 'analytics-widget',
      columns: 4,
      height: '405px',
      content: {
        kind: 'gauge',
        title: 'Assisted sale rate',
        subtitle: 'Compared with yesterday',
        value: 73,
      },
    },
    {
      id: 'campaign-calendar',
      type: 'analytics-widget',
      columns: 4,
      height: '405px',
      content: {
        kind: 'calendar',
        title: 'Retail moment calendar',
        subtitle: 'January, 2024',
      },
    },
    {
      id: 'left-stack',
      columns: 6,
      children: [
        {
          id: 'queue-forecast',
          type: 'analytics-widget',
          columns: 12,
          height: '352px',
          content: {
            kind: 'line',
            title: 'Checkout lane pressure',
            subtitle: 'Average wait forecast by hour',
          },
        },
        {
          id: 'traffic-moments',
          type: 'analytics-widget',
          columns: 12,
          height: '282px',
          content: {
            kind: 'activity',
            title: 'Store movement windows',
            subtitle: 'Customer movement highlights',
          },
        },
      ],
    },
    {
      id: 'signal-ledger',
      type: 'analytics-widget',
      columns: 6,
      height: '658px',
      content: {
        kind: 'events',
        title: 'Detection history',
        subtitle: 'Latest automated detections',
      },
    },
  ]);
}
