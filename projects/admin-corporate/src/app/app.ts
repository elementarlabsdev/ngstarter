import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Badge } from '@ngstarter-ui/components/badge';
import { BreadcrumbsGlobal, BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardAside, CardContent, CardHeader } from '@ngstarter-ui/components/card';
import { Chip } from '@ngstarter-ui/components/chips';
import { InitialsPipe } from '@ngstarter-ui/components/core';
import { FormField, IconPrefix } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { Layout, LayoutContent } from '@ngstarter-ui/components/layout';
import { Menu, MenuDivider, MenuHeading, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavHeading,
  SidebarNavItem,
  SidebarNavItemBadgeDirective,
  SidebarNavItemIconDirective,
} from '@ngstarter-ui/components/sidebar';
import { Sidenav, SidenavContainer, SidenavContent } from '@ngstarter-ui/components/sidenav';

interface NavItem {
  readonly key: string;
  readonly label: string;
  readonly icon: string;
  readonly count?: number;
}

interface NavSection {
  readonly label?: string;
  readonly stickToBottom?: boolean;
  readonly items: readonly NavItem[];
}

interface ForecastSummary {
  readonly value: string;
  readonly summary: string;
  readonly confidence: string;
  readonly progress: number;
  readonly bars: readonly number[];
  readonly peak?: number;
}

@Component({
  selector: 'app-root',
  imports: [
    Avatar,
    Badge,
    BreadcrumbsGlobal,
    Button,
    FormField,
    Icon,
    IconPrefix,
    InitialsPipe,
    Input,
    Layout,
    LayoutContent,
    Menu,
    MenuDivider,
    MenuHeading,
    MenuItem,
    MenuTrigger,
    ScrollbarArea,
    Sidebar,
    SidebarBody,
    SidebarFooter,
    SidebarHeader,
    SidebarNav,
    SidebarNavHeading,
    SidebarNavItem,
    SidebarNavItemBadgeDirective,
    SidebarNavItemIconDirective,
    Sidenav,
    SidenavContainer,
    SidenavContent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly _breadcrumbsStore = inject(BreadcrumbsStore);

  protected readonly brandName = signal('Corporate');
  protected readonly userName = signal('Pavel Sal');

  constructor() {
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        name: 'Dashboard',
        type: null,
      },
    ]);
  }

  protected readonly navSections = signal<readonly NavSection[]>([
    {
      items: [
        { key: 'home', label: 'Dashboard', icon: 'fluent:grid-24-filled' },
        { key: 'inbox', label: 'Work Queue', icon: 'fluent:tray-item-add-24-regular', count: 18 },
        { key: 'calendar', label: 'Schedule', icon: 'fluent:calendar-ltr-24-regular', count: 9 },
      ],
    },
    {
      label: 'Customer Operations',
      items: [
        { key: 'accounts', label: 'Accounts', icon: 'fluent:building-people-24-regular', count: 64 },
        { key: 'success-plans', label: 'Success Plans', icon: 'fluent:target-arrow-24-regular', count: 28 },
        { key: 'renewals', label: 'Renewals', icon: 'fluent:document-sync-24-regular', count: 17 },
        { key: 'support', label: 'Support Queue', icon: 'fluent:headset-24-regular', count: 31 },
        { key: 'feedback', label: 'Product Feedback', icon: 'fluent:chat-multiple-24-regular', count: 12 },
      ],
    },
    {
      label: 'Revenue',
      items: [
        { key: 'pipeline', label: 'Pipeline', icon: 'fluent:chart-multiple-24-regular', count: 48 },
        { key: 'forecast', label: 'Forecast', icon: 'fluent:arrow-trending-24-regular' },
        { key: 'contracts', label: 'Contracts', icon: 'fluent:document-signature-24-regular', count: 22 },
        { key: 'invoices', label: 'Invoices', icon: 'fluent:receipt-money-24-regular', count: 8 },
      ],
    },
    {
      label: 'Company',
      items: [
        { key: 'teams', label: 'Teams', icon: 'fluent:people-team-24-regular' },
        { key: 'knowledge', label: 'Knowledge Base', icon: 'fluent:book-open-24-regular' },
        { key: 'automation', label: 'Automation', icon: 'fluent:flowchart-24-regular' },
        { key: 'security', label: 'Security', icon: 'fluent:shield-keyhole-24-regular' },
        { key: 'analytics', label: 'Analytics', icon: 'fluent:data-pie-24-regular' },
      ],
    },
    {
      stickToBottom: true,
      items: [
        { key: 'preferences', label: 'Preferences', icon: 'fluent:options-24-regular' },
        { key: 'help', label: 'Help Center', icon: 'fluent:question-circle-24-regular' },
      ],
    },
  ]);

  protected readonly forecast = signal<ForecastSummary>({
    value: '$1.18M',
    summary: 'Forecast is tracking above plan with expansion concentrated in enterprise accounts.',
    confidence: 'High confidence',
    progress: 78,
    bars: [46, 52, 48, 61, 70, 74, 82],
    peak: 74,
  });
}
