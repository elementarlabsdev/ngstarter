import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Avatar } from '@ngstarter-ui/components/avatar';
import { Badge } from '@ngstarter-ui/components/badge';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardAside, CardContent, CardHeader } from '@ngstarter-ui/components/card';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { Chip, ChipControl } from '@ngstarter-ui/components/chips';
import { Icon } from '@ngstarter-ui/components/icon';
import { Layout, LayoutContent } from '@ngstarter-ui/components/layout';
import { Menu, MenuDivider, MenuHeading, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
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
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { Sidenav, SidenavContainer, SidenavContent } from '@ngstarter-ui/components/sidenav';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
  RowDef,
  Table,
} from '@ngstarter-ui/components/table';
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

interface StatCard {
  readonly title: string;
  readonly icon: string;
  readonly value: string;
  readonly delta: string;
  readonly bars: readonly number[];
  readonly peak?: number;
}

interface Task {
  readonly title: string;
  readonly owner: string;
  readonly avatar: string;
  readonly status: 'Overdue' | 'Todo' | 'Doing';
  readonly dueDate: string;
  readonly checked?: boolean;
}

interface ComplianceItem {
  readonly name: string;
  readonly avatar: string;
  readonly progress: number;
}

interface Applicant {
  readonly name: string;
  readonly avatar: string;
  readonly job: string;
}

interface Interview {
  readonly day: string;
  readonly date: string;
  readonly time: string;
  readonly timezone: string;
  readonly person: string;
  readonly accent: 'primary' | 'green' | 'blue' | 'orange';
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
    Checkbox,
    Chip,
    ChipControl,
    CorporateMiniChart,
    Icon,
    Layout,
    LayoutContent,
    Menu,
    MenuDivider,
    MenuHeading,
    MenuItem,
    MenuTrigger,
    Cell,
    CellDef,
    ColumnDef,
    HeaderCell,
    HeaderCellDef,
    HeaderRow,
    HeaderRowDef,
    ProgressBar,
    Row,
    RowDef,
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
    Table,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly brandName = signal('Corporate');
  protected readonly userName = signal('Virgil Varelino');

  protected readonly navSections = signal<readonly NavSection[]>([
    {
      items: [
        { key: 'home', label: 'Home', icon: 'fluent:home-24-filled' },
        { key: 'calendar', label: 'Calendar', icon: 'fluent:calendar-ltr-24-regular', count: 16 },
        { key: 'task', label: 'Task', icon: 'fluent:clipboard-task-24-regular', count: 40 },
      ],
    },
    {
      label: 'Talent & Recruitment',
      items: [
        { key: 'jobs', label: 'Jobs', icon: 'fluent:briefcase-24-regular', count: 120 },
        { key: 'interviews', label: 'Interviews', icon: 'fluent:person-feedback-24-regular', count: 42 },
        { key: 'offers', label: 'Offers', icon: 'fluent:document-signature-24-regular', count: 20 },
        { key: 'visa', label: 'Visa', icon: 'fluent:card-ui-24-regular', count: 14 },
        { key: 'candidates', label: 'Candidates', icon: 'fluent:people-community-24-regular', count: 42 },
      ],
    },
    {
      label: 'Internal',
      items: [
        { key: 'staff', label: 'Staff', icon: 'fluent:person-24-regular' },
        { key: 'compliance', label: 'Compliance', icon: 'fluent:shield-task-24-regular' },
        {
          key: 'onboarding',
          label: 'Onboarding & Offboarding',
          icon: 'fluent:people-swap-24-regular',
        },
        { key: 'training', label: 'Training', icon: 'fluent:learning-app-24-regular' },
      ],
    },
    {
      label: 'Management',
      items: [
        { key: 'report', label: 'Report', icon: 'fluent:chart-multiple-24-regular' },
        { key: 'users', label: 'Users', icon: 'fluent:people-team-24-regular' },
        { key: 'settings', label: 'Compliance Settings', icon: 'fluent:settings-24-regular' },
        { key: 'agency', label: 'Agency', icon: 'fluent:building-24-regular' },
        { key: 'career', label: 'Career Site', icon: 'fluent:window-apps-24-regular' },
      ],
    },
    {
      stickToBottom: true,
      items: [
        { key: 'preferences', label: 'Preferences', icon: 'fluent:options-24-regular' },
        { key: 'help', label: 'Help & Support', icon: 'fluent:headphones-24-regular' },
      ],
    },
  ]);

  protected readonly stats = signal<readonly StatCard[]>([
    {
      title: 'Total Candidates',
      icon: 'fluent:people-team-24-filled',
      value: '421',
      delta: '12%',
      bars: [34, 58, 46, 72, 56, 78, 92],
      peak: 59,
    },
    {
      title: 'Candidate Interviewed',
      icon: 'fluent:person-call-24-filled',
      value: '240',
      delta: '12%',
      bars: [30, 66, 52, 82, 54, 84, 44],
    },
    {
      title: 'Active Jobs',
      icon: 'fluent:briefcase-24-filled',
      value: '124',
      delta: '12%',
      bars: [30, 44, 42, 70, 84, 56, 78],
    },
    {
      title: 'Offer Accepted',
      icon: 'fluent:mail-inbox-checkmark-24-filled',
      value: '210',
      delta: '12%',
      bars: [30, 46, 42, 48, 62, 78, 90],
    },
  ]);

  protected readonly tasks = signal<readonly Task[]>([
    {
      title: 'Join the Teacher Growth Workshop',
      owner: 'John Freed',
      avatar: 'J',
      status: 'Overdue',
      dueDate: 'Fri, 14 Feb',
    },
    {
      title: 'Get Midterm Materials Ready',
      owner: 'Panji Dwi',
      avatar: 'P',
      status: 'Todo',
      dueDate: 'Thu, 13 Feb',
      checked: true,
    },
    {
      title: 'Interview feedback for JC',
      owner: 'Luca Modric',
      avatar: 'L',
      status: 'Doing',
      dueDate: 'Wed, 12 Feb',
    },
    {
      title: 'Update Student Progress Reports',
      owner: 'Yahyo',
      avatar: 'Y',
      status: 'Doing',
      dueDate: 'Wed, 12 Feb',
    },
    {
      title: 'Catch Up with the Curriculum Team',
      owner: 'Aditya Irawan',
      avatar: 'A',
      status: 'Doing',
      dueDate: 'Thu, 13 Feb',
      checked: true,
    },
  ]);

  protected readonly compliance = signal<readonly ComplianceItem[]>([
    { name: 'Tea Assiddiq', avatar: 'T', progress: 50 },
    { name: 'Rizki Kurniawan', avatar: 'R', progress: 25 },
    { name: 'Taufik Hidayat', avatar: 'T', progress: 80 },
    { name: 'Mufti Hidayat', avatar: 'M', progress: 25 },
    { name: 'Wildan Athok', avatar: 'W', progress: 10 },
  ]);

  protected readonly applicants = signal<readonly Applicant[]>([
    { name: 'Liam Carter', avatar: 'L', job: 'IT Support for School' },
    { name: 'Aditya Irawan', avatar: 'A', job: 'Math Teacher' },
    { name: 'Jamal Mahfud', avatar: 'J', job: 'IT Support for School' },
    { name: 'Mason Turner', avatar: 'M', job: 'School Administrator' },
    { name: 'Panji Dwi', avatar: 'P', job: 'Teacher Assistant' },
  ]);

  protected readonly interviews = signal<readonly Interview[]>([
    {
      day: 'Thu',
      date: '17',
      time: '09:00AM - 10:00AM',
      timezone: 'GMT+8',
      person: 'Ahmad Zainy',
      accent: 'orange',
    },
    {
      day: 'Thu',
      date: '17',
      time: '11:00AM - 12:00AM',
      timezone: 'GMT+7',
      person: 'Yahyo',
      accent: 'green',
    },
    {
      day: 'Thu',
      date: '17',
      time: '01:00PM - 02:00PM',
      timezone: 'GMT+9',
      person: 'Tea Assiddiq',
      accent: 'blue',
    },
    {
      day: 'Sat',
      date: '18',
      time: '11:00AM - 12:00AM',
      timezone: 'GMT+1',
      person: 'Ahmad Zainy',
      accent: 'green',
    },
    {
      day: 'Tue',
      date: '19',
      time: '01:00PM - 02:00PM',
      timezone: 'GMT+8',
      person: 'Panji Dwi',
      accent: 'green',
    },
    {
      day: 'Tue',
      date: '19',
      time: '02:00PM - 03:00PM',
      timezone: 'GMT+8',
      person: 'Panji Dwi',
      accent: 'blue',
    },
    {
      day: 'Wed',
      date: '20',
      time: '09:00AM - 10:00AM',
      timezone: 'GMT+10',
      person: 'Tea Assiddiq',
      accent: 'orange',
    },
  ]);

  protected readonly weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
  protected readonly taskColumns = ['title', 'owner', 'status', 'dueDate'] as const;
  protected readonly complianceColumns = ['name', 'progress'] as const;
  protected readonly applicantColumns = ['name', 'job'] as const;

  protected avatarColor(label: string): string {
    const colors: Record<string, string> = {
      A: '#38aeea',
      J: '#38aeea',
      L: '#35ad70',
      M: '#036fe3',
      P: '#38aeea',
      R: '#036fe3',
      T: '#35ad70',
      W: '#35ad70',
      Y: '#036fe3',
    };

    return colors[label] ?? '#036fe3';
  }
}
