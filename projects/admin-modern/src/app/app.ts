import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Badge } from '@ngstarter-ui/components/badge';
import { Button } from '@ngstarter-ui/components/button';
import {
  Card,
  CardAside,
  CardContent,
  CardFooter,
  CardHeader,
} from '@ngstarter-ui/components/card';
import { Chip, ChipSet } from '@ngstarter-ui/components/chips';
import {
  FormField,
  IconButtonSuffix,
  IconPrefix,
  Label,
} from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { Layout, LayoutContent } from '@ngstarter-ui/components/layout';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemLine,
  ListItemMeta,
  ListItemTitle,
} from '@ngstarter-ui/components/list';
import { Menu, MenuHeader, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { Panel, PanelAside, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { Popover, PopoverTriggerForDirective } from '@ngstarter-ui/components/popover';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarNavItemBadgeDirective,
  SidebarNavItemIconDirective,
} from '@ngstarter-ui/components/sidebar';
import { Sidenav, SidenavContainer, SidenavContent } from '@ngstarter-ui/components/sidenav';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';

interface NavItem {
  readonly key: string;
  readonly label: string;
  readonly icon: string;
  readonly alert?: boolean;
}

interface Filter {
  readonly label: string;
  readonly count?: number;
}

interface Vacancy {
  readonly title: string;
  readonly company: string;
  readonly location: string;
  readonly type: 'Full-time' | 'Contract' | 'Remote';
  readonly typeTone: 'blue' | 'orange' | 'dark';
  readonly summary: string;
  readonly tags: readonly string[];
  readonly applicants: number;
  readonly interviews: number;
}

interface NotificationItem {
  readonly title: string;
  readonly meta: string;
  readonly icon: string;
  readonly unread?: boolean;
}

@Component({
  selector: 'app-root',
  imports: [
    Avatar,
    Badge,
    Button,
    Card,
    CardAside,
    CardContent,
    CardHeader,
    Chip,
    ChipSet,
    FormField,
    Icon,
    IconPrefix,
    Input,
    Label,
    Layout,
    LayoutContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemLine,
    ListItemMeta,
    ListItemTitle,
    Menu,
    MenuHeader,
    MenuItem,
    MenuTrigger,
    Panel,
    PanelAside,
    PanelContent,
    PanelHeader,
    Popover,
    PopoverTriggerForDirective,
    Sidebar,
    SidebarBody,
    SidebarFooter,
    SidebarHeader,
    SidebarNav,
    SidebarNavItem,
    SidebarNavItemBadgeDirective,
    SidebarNavItemIconDirective,
    Sidenav,
    SidenavContainer,
    SidenavContent,
    ScrollbarArea,
    IconButtonSuffix,
    CardFooter,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly search = signal('');

  protected readonly navItems = signal<readonly NavItem[]>([
    { key: 'Home', label: 'Home', icon: 'fluent:home-24-regular' },
    { key: 'Targets', label: 'Targets', icon: 'fluent:target-arrow-24-regular' },
    { key: 'Inbox', label: 'Inbox', icon: 'fluent:mail-inbox-24-regular', alert: true },
    { key: 'Vacancies', label: 'Vacancies', icon: 'fluent:briefcase-24-regular' },
    { key: 'Deals', label: 'Deals', icon: 'fluent:briefcase-24-regular' },
    { key: 'Notes', label: 'Notes', icon: 'fluent:document-text-24-regular' },
    { key: 'Reports', label: 'Reports', icon: 'fluent:chart-multiple-24-regular' },
  ]);

  protected readonly filters = signal<readonly Filter[]>([
    { label: 'Type' },
    { label: 'Department', count: 2 },
    { label: 'Work mode' },
    { label: 'Location', count: 4 },
    { label: 'Hiring status' },
  ]);

  protected readonly notifications = signal<readonly NotificationItem[]>([
    {
      title: 'New candidate match',
      meta: 'Maya Lewis applied to Product Designer · 5m',
      icon: 'fluent:person-add-24-regular',
      unread: true,
    },
    {
      title: 'Interview scheduled',
      meta: 'Senior Angular Engineer · tomorrow 10:30',
      icon: 'fluent:mail-inbox-24-regular',
    },
    {
      title: 'Pipeline update',
      meta: '3 vacancies moved to final review · 1h',
      icon: 'fluent:arrow-trending-24-regular',
    },
  ]);

  protected readonly vacancies = signal<readonly Vacancy[]>([
    {
      title: 'Senior Product Designer',
      company: 'Lumin Labs',
      location: 'San Francisco, CA',
      type: 'Full-time',
      typeTone: 'blue',
      summary: 'Lead product design for AI workflow tools and design systems',
      tags: ['Product', 'Design systems', 'AI', 'Senior', 'Hybrid'],
      applicants: 42,
      interviews: 6,
    },
    {
      title: 'Angular Platform Engineer',
      company: 'Northstar Cloud',
      location: 'London, UK',
      type: 'Remote',
      typeTone: 'orange',
      summary: 'Build shared UI infrastructure for data-heavy enterprise products',
      tags: ['Angular', 'TypeScript', 'Design system', 'Remote'],
      applicants: 28,
      interviews: 4,
    },
    {
      title: 'Growth Marketing Lead',
      company: 'OrbitPay',
      location: 'Berlin, Germany',
      type: 'Full-time',
      typeTone: 'blue',
      summary: 'Own acquisition experiments and lifecycle campaigns for fintech teams',
      tags: ['Growth', 'Fintech', 'Lifecycle', 'B2B'],
      applicants: 35,
      interviews: 5,
    },
    {
      title: 'Revenue Operations Manager',
      company: 'HelioWorks',
      location: 'New York, NY',
      type: 'Contract',
      typeTone: 'dark',
      summary: 'Improve CRM hygiene, forecasting workflows, and sales reporting',
      tags: ['RevOps', 'CRM', 'Forecasting', 'Contract'],
      applicants: 19,
      interviews: 3,
    },
    {
      title: 'Machine Learning Engineer',
      company: 'Atlas AI',
      location: 'Austin, TX',
      type: 'Remote',
      typeTone: 'orange',
      summary: 'Ship retrieval, ranking, and evaluation pipelines for SaaS copilots',
      tags: ['ML', 'Python', 'RAG', 'Evaluation'],
      applicants: 51,
      interviews: 8,
    },
    {
      title: 'Enterprise Account Executive',
      company: 'Stackline',
      location: 'London, UK',
      type: 'Full-time',
      typeTone: 'blue',
      summary: 'Run strategic sales cycles for mid-market and enterprise SaaS accounts',
      tags: ['Sales', 'SaaS', 'Enterprise', 'Pipeline'],
      applicants: 23,
      interviews: 4,
    },
    {
      title: 'Customer Success Strategist',
      company: 'Meridian Ops',
      location: 'Toronto, Canada',
      type: 'Contract',
      typeTone: 'dark',
      summary: 'Design onboarding playbooks and expansion motions for key customers',
      tags: ['Success', 'Onboarding', 'Automation'],
      applicants: 31,
      interviews: 2,
    },
    {
      title: 'Product Analytics Lead',
      company: 'Cobalt Metrics',
      location: 'Paris, France',
      type: 'Remote',
      typeTone: 'blue',
      summary: 'Turn product usage signals into roadmap and activation insights',
      tags: ['Analytics', 'PLG', 'SQL', 'Activation'],
      applicants: 37,
      interviews: 6,
    },
  ]);
}
