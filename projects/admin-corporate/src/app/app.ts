import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Badge } from '@ngstarter-ui/components/badge';
import { BreadcrumbsGlobal, BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { Button } from '@ngstarter-ui/components/button';
import { InitialsPipe } from '@ngstarter-ui/components/core';
import { FormField, IconPrefix } from '@ngstarter-ui/components/form-field';
import { Grid, GridItem, GridItemConfig } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { Layout, LayoutContent } from '@ngstarter-ui/components/layout';
import { Menu, MenuDivider, MenuHeading, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarNav,
  SidebarNavItem,
  SidebarNavItemBadgeDirective,
  SidebarNavItemIconDirective,
} from '@ngstarter-ui/components/sidebar';
import { Sidenav, SidenavContainer, SidenavContent } from '@ngstarter-ui/components/sidenav';
import { Toolbar, ToolbarItem, ToolbarSpacer, ToolbarTitle } from '@ngstarter-ui/components/toolbar';
import {Logo} from "@ngstarter-ui/components/logo";
import {SplashScreen} from "@ngstarter-ui/components/splash-screen";

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

interface DashboardMetric {
  readonly title: string;
  readonly value: string;
  readonly icon: string;
  readonly watermark: string;
  readonly note: string;
  readonly positive?: boolean;
}

interface PipelineStage {
  readonly label: string;
  readonly count: string;
  readonly value: string;
  readonly progress: number;
  readonly tone: 'primary' | 'accent' | 'success';
}

interface ActivityItem {
  readonly icon: string;
  readonly tone: 'success' | 'info' | 'warning' | 'neutral';
  readonly actor: string;
  readonly action: string;
  readonly subject: string;
  readonly time: string;
}

interface TaskItem {
  readonly title: string;
  readonly priority: string;
  readonly due: string;
}

interface RegionalSale {
  readonly region: string;
  readonly value: string;
  readonly percent: number;
}

interface TeamUpdate {
  readonly icon: string;
  readonly tone: 'alert' | 'message';
  readonly title: string;
  readonly message: string;
}

@Component({
  selector: 'app-root',
  imports: [
    Avatar,
    Badge,
    BreadcrumbsGlobal,
    Button,
    FormField,
    Grid,
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
    Panel,
    PanelContent,
    PanelHeader,
    ScrollbarArea,
    Sidebar,
    SidebarBody,
    SidebarFooter,
    SidebarHeader,
    SidebarHeading,
    SidebarNav,
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
    Logo,
    SplashScreen,
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
        name: 'Home',
        type: 'link',
        route: '/',
      },
      {
        id: 'dashboard',
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

  protected readonly dashboardMetrics = signal<readonly DashboardMetric[]>([
    {
      title: 'Total Revenue',
      value: '$2.4M',
      icon: 'fluent:wallet-credit-card-24-regular',
      watermark: 'fluent:money-24-regular',
      note: '+12.5% vs last month',
      positive: true,
    },
    {
      title: 'New Leads',
      value: '342',
      icon: 'fluent:people-add-24-regular',
      watermark: 'fluent:people-add-24-regular',
      note: '+8.2% vs last month',
      positive: true,
    },
    {
      title: 'Active Deals',
      value: '89',
      icon: 'fluent:briefcase-24-regular',
      watermark: 'fluent:handshake-24-regular',
      note: 'Across 4 stages',
    },
  ]);

  protected readonly pipelineStages = signal<readonly PipelineStage[]>([
    { label: 'Discovery', count: '124 Leads', value: '$840k Value', progress: 100, tone: 'primary' },
    { label: 'Proposal', count: '68 Deals', value: '$1.2M Value', progress: 75, tone: 'primary' },
    { label: 'Negotiation', count: '32 Deals', value: '$450k Value', progress: 45, tone: 'accent' },
    { label: 'Closed Won', count: '15 Deals', value: '$280k Value', progress: 25, tone: 'success' },
  ]);

  protected readonly recentActivity = signal<readonly ActivityItem[]>([
    {
      icon: 'fluent:checkmark-24-regular',
      tone: 'success',
      actor: 'Sarah Jenkins',
      action: 'closed the',
      subject: 'Acme Corp',
      time: '2 hours ago - $45,000',
    },
    {
      icon: 'fluent:call-24-regular',
      tone: 'info',
      actor: 'Mike Ross',
      action: 'logged a call with',
      subject: 'TechGlobal',
      time: '4 hours ago',
    },
    {
      icon: 'fluent:mail-24-regular',
      tone: 'warning',
      actor: 'System',
      action: 'sent automated follow-up to',
      subject: '12 leads',
      time: 'Yesterday at 4:30 PM',
    },
    {
      icon: 'fluent:document-edit-24-regular',
      tone: 'neutral',
      actor: 'Amanda Lin',
      action: 'updated proposal for',
      subject: 'Beta Innovations',
      time: 'Yesterday at 2:15 PM',
    },
  ]);

  protected readonly taskSummary = signal<readonly TaskItem[]>([
    { title: 'Q4 Revenue Review', priority: 'High Priority', due: 'Due Tomorrow' },
    { title: 'Acme Corp Follow-up', priority: 'High Priority', due: 'Oct 24' },
    { title: 'Regional Lead Meeting', priority: 'Medium Priority', due: 'Oct 26' },
    { title: 'Enterprise Renewal Prep', priority: 'Medium Priority', due: 'Oct 28' },
    { title: 'Partner Pipeline Audit', priority: 'Low Priority', due: 'Oct 30' },
  ]);

  protected readonly regionalSales = signal<readonly RegionalSale[]>([
    { region: 'North America', value: '$1.2M', percent: 50 },
    { region: 'Europe', value: '$0.8M', percent: 33 },
    { region: 'Asia', value: '$0.4M', percent: 17 },
    { region: 'Latin America', value: '$0.2M', percent: 9 },
  ]);

  protected readonly revenueGrowth = signal([46, 64, 52, 82, 70, 100]);
  protected readonly revenueMonths = signal(['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']);

  protected readonly teamUpdates = signal<readonly TeamUpdate[]>([
    {
      icon: 'fluent:warning-24-regular',
      tone: 'alert',
      title: 'Quota Alert',
      message: 'Team is at 85% of Q4 goal.',
    },
    {
      icon: 'fluent:comment-24-regular',
      tone: 'message',
      title: 'James Miller',
      message: '"Just updated the Acme docs."',
    },
    {
      icon: 'fluent:people-team-24-regular',
      tone: 'message',
      title: 'Sales Standup',
      message: 'Pipeline review starts at 3:00 PM.',
    },
    {
      icon: 'fluent:target-arrow-24-regular',
      tone: 'alert',
      title: 'Forecast Check',
      message: 'West region needs commit updates.',
    },
  ]);

  protected readonly dashboardGridConfigs = signal<GridItemConfig[]>([
    {
      type: 'dashboard-widget',
      plain: true,
      component: () =>
        import('./corporate-dashboard-widget/corporate-dashboard-widget')
          .then(component => component.CorporateDashboardWidget),
    },
  ]);

  protected readonly dashboardGridItems = computed<GridItem[]>(() => {
    const metrics = this.dashboardMetrics();

    return [
      ...metrics.map((metric, index) => ({
        id: `metric-${index}`,
        type: 'dashboard-widget',
        columns: 4,
        // height: '11.75rem',
        content: {
          kind: 'metric',
          metric,
        },
      })),
      {
        id: 'pipeline',
        type: 'dashboard-widget',
        columns: 8,
        height: '27rem',
        content: {
          kind: 'pipeline',
          stages: this.pipelineStages(),
        },
      },
      {
        id: 'activity',
        type: 'dashboard-widget',
        columns: 4,
        // height: '29rem',
        content: {
          kind: 'activity',
          items: this.recentActivity(),
        },
      },
      {
        id: 'tasks',
        type: 'dashboard-widget',
        columns: 6,
        // height: '29rem',
        content: {
          kind: 'tasks',
          items: this.taskSummary(),
        },
      },
      {
        id: 'regional',
        type: 'dashboard-widget',
        columns: 6,
        height: '22.5rem',
        content: {
          kind: 'regional',
          items: this.regionalSales(),
        },
      },
      {
        id: 'revenue',
        type: 'dashboard-widget',
        columns: 6,
        // height: '17.5rem',
        content: {
          kind: 'revenue',
          values: this.revenueGrowth(),
          months: this.revenueMonths(),
        },
      },
      {
        id: 'team',
        type: 'dashboard-widget',
        columns: 6,
        // height: '22.5rem',
        content: {
          kind: 'team',
          items: this.teamUpdates(),
        },
      },
    ];
  });
}
