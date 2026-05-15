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
import { CorporateMiniChart } from './corporate-mini-chart/corporate-mini-chart';

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

interface AccountHealth {
  readonly name: string;
  readonly owner: string;
  readonly avatar: string;
  readonly score: number;
  readonly status: 'Healthy' | 'Watch' | 'At risk';
}

interface RenewalStage {
  readonly stage: string;
  readonly accounts: number;
  readonly amount: string;
  readonly progress: number;
}

interface SlaMetric {
  readonly label: string;
  readonly icon: string;
  readonly value: string;
  readonly target: string;
}

interface ProductAdoption {
  readonly name: string;
  readonly seats: string;
  readonly change: string;
  readonly progress: number;
}

interface ExecutiveNote {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

@Component({
  selector: 'app-root',
  imports: [
    Avatar,
    Badge,
    BreadcrumbsGlobal,
    Button,
    Card,
    CardAside,
    CardContent,
    CardHeader,
    Chip,
    CorporateMiniChart,
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
    ProgressBar,
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

  protected readonly accountHealth = signal<readonly AccountHealth[]>([
    { name: 'Acme Logistics', owner: 'Maya Chen', avatar: 'A', score: 88, status: 'Healthy' },
    { name: 'Northwind Health', owner: 'Noah Reed', avatar: 'N', score: 62, status: 'Watch' },
    { name: 'Helio Energy', owner: 'Leah Park', avatar: 'H', score: 42, status: 'At risk' },
    { name: 'Orbit Retail', owner: 'Iris Morgan', avatar: 'O', score: 74, status: 'Healthy' },
  ]);

  protected readonly renewalPipeline = signal<readonly RenewalStage[]>([
    { stage: 'Discovery', accounts: 18, amount: '$312K', progress: 36 },
    { stage: 'Proposal', accounts: 11, amount: '$486K', progress: 58 },
    { stage: 'Legal', accounts: 7, amount: '$271K', progress: 72 },
    { stage: 'Committed', accounts: 5, amount: '$426K', progress: 91 },
  ]);

  protected readonly slaMetrics = signal<readonly SlaMetric[]>([
    { label: 'First response', icon: 'fluent:timer-24-regular', value: '14m', target: 'Target 20m' },
    { label: 'Resolution', icon: 'fluent:checkmark-circle-24-regular', value: '91%', target: 'Target 88%' },
    { label: 'Backlog', icon: 'fluent:tray-item-add-24-regular', value: '38', target: 'Down 12%' },
    { label: 'Escalations', icon: 'fluent:warning-24-regular', value: '12', target: '3 critical' },
  ]);

  protected readonly productAdoption = signal<readonly ProductAdoption[]>([
    { name: 'Workflow Builder', seats: '1,284', change: '+18%', progress: 82 },
    { name: 'Analytics Studio', seats: '944', change: '+11%', progress: 68 },
    { name: 'Automation Rules', seats: '718', change: '+7%', progress: 54 },
    { name: 'Client Portal', seats: '1,502', change: '+24%', progress: 91 },
  ]);

  protected readonly executiveNotes = signal<readonly ExecutiveNote[]>([
    {
      title: 'Finance cohort needs pricing review',
      description: 'Three strategic renewals need guardrail approval before Friday.',
      icon: 'fluent:money-24-regular',
    },
    {
      title: 'Support volume moved to stable',
      description: 'Automation deflected 212 low-priority tickets this week.',
      icon: 'fluent:bot-24-regular',
    },
    {
      title: 'Enterprise adoption is ahead of plan',
      description: 'Client Portal usage reached a new weekly high across tier-one accounts.',
      icon: 'fluent:rocket-24-regular',
    },
  ]);

  protected readonly weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
}
