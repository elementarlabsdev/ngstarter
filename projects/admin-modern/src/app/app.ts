import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, IconButtonSuffix, IconPrefix, Label } from '@ngstarter-ui/components/form-field';
import { Grid, GridItem, GridItemConfig } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { Layout, LayoutContent } from '@ngstarter-ui/components/layout';
import { Logo, LogoText } from '@ngstarter-ui/components/logo';
import { Menu, MenuDivider, MenuHeading, MenuHeader, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
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
    Logo,
    LogoText,
    Menu,
    MenuDivider,
    MenuHeading,
    MenuHeader,
    MenuItem,
    MenuTrigger,
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
  protected readonly sidenavOpened = signal(true);

  protected readonly dashboardSections = signal<readonly NavSection[]>([
    {
      label: 'Saved Studios',
      items: [
        { key: 'daily-room', label: 'Content Room - Daily', icon: 'fluent:clock-24-regular' },
        {
          key: 'realtime',
          label: 'Launch Room - Live',
          icon: 'fluent:chart-multiple-24-regular',
        },
      ],
    },
    {
      label: 'Creative Workflows',
      items: [
        { key: 'prompt-lab', label: 'Prompt experiment board', icon: 'fluent:beaker-24-regular' },
        { key: 'voice-checks', label: 'Brand voice checks', icon: 'fluent:text-grammar-wand-24-regular' },
        { key: 'asset-gen', label: 'Asset generation queue', icon: 'fluent:image-multiple-24-regular' },
        { key: 'editorial', label: 'Editorial review desk', icon: 'fluent:document-edit-24-regular' },
        { key: 'publishing', label: 'Publishing calendar', icon: 'fluent:calendar-ltr-24-regular' },
      ],
    },
  ]);

  protected readonly organizationItems = signal<readonly NavItem[]>([
    { key: 'brand-kits', label: 'Brand kits', icon: 'fluent:paint-brush-24-regular' },
    { key: 'channels', label: 'Channel presets', icon: 'fluent:megaphone-24-regular' },
    { key: 'model-access', label: 'Model access', icon: 'fluent:key-24-regular' },
  ]);

  protected readonly footerItems = signal<readonly NavItem[]>([
    { key: 'briefing', label: 'Creative briefing', icon: 'fluent:lightbulb-24-regular' },
  ]);

  protected readonly dashboardGridConfigs = signal<GridItemConfig[]>([
    {
      type: 'audience-widget',
      plain: true,
      component: () =>
        import('./widgets/audience-dashboard-widget/audience-dashboard-widget').then((module) => module.AudienceDashboardWidget),
    },
    {
      type: 'gauge-widget',
      plain: true,
      component: () =>
        import('./widgets/gauge-dashboard-widget/gauge-dashboard-widget').then((module) => module.GaugeDashboardWidget),
    },
    {
      type: 'calendar-widget',
      plain: true,
      component: () =>
        import('./widgets/calendar-dashboard-widget/calendar-dashboard-widget').then((module) => module.CalendarDashboardWidget),
    },
    {
      type: 'line-widget',
      plain: true,
      component: () =>
        import('./widgets/line-dashboard-widget/line-dashboard-widget').then((module) => module.LineDashboardWidget),
    },
    {
      type: 'model-spend-widget',
      plain: true,
      component: () =>
        import('./widgets/model-spend-widget/model-spend-widget').then((module) => module.ModelSpendWidget),
    },
    {
      type: 'events-widget',
      plain: true,
      component: () =>
        import('./widgets/events-dashboard-widget/events-dashboard-widget').then((module) => module.EventsDashboardWidget),
    },
  ]);

  protected readonly dashboardGridItems = signal<GridItem[]>([
    {
      id: 'audience-pulse',
      type: 'audience-widget',
      columns: 4,
      height: '405px',
      content: {
        title: 'Audience pulse',
        subtitle: 'Predicted response quality by channel',
      },
    },
    {
      id: 'conversion-pulse',
      type: 'gauge-widget',
      columns: 4,
      height: '405px',
      content: {
        title: 'Brand alignment',
        subtitle: 'Generated drafts matching voice rules',
        value: 88,
      },
    },
    {
      id: 'campaign-calendar',
      type: 'calendar-widget',
      columns: 4,
      height: '405px',
      content: {
        title: 'Publishing calendar',
        subtitle: 'October, 2026',
      },
    },
    {
      id: 'left-stack',
      columns: 6,
      children: [
        {
          id: 'queue-forecast',
          type: 'line-widget',
          columns: 12,
          height: '352px',
          content: {
            title: 'Generation latency',
            subtitle: 'Average render time across model lanes',
          },
        },
        {
          id: 'model-spend',
          type: 'model-spend-widget',
          columns: 12,
          height: '282px',
          content: {
            title: 'Model spend mix',
            subtitle: 'Token budget by model family',
          },
        },
      ],
    },
    {
      id: 'signal-ledger',
      type: 'events-widget',
      columns: 6,
      height: '658px',
      content: {
        title: 'Research signals board',
        subtitle: 'Audience insights awaiting triage',
      },
    },
  ]);
}
