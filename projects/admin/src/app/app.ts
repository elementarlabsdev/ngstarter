import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { FormField, IconPrefix, Label } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  Navigation,
  NavigationItem,
  NavigationItemIconDirective,
} from '@ngstarter-ui/components/navigation';
import { Paginator } from '@ngstarter-ui/components/paginator';
import { ProgressBar } from '@ngstarter-ui/components/progress-bar';
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
import { Input } from '@ngstarter-ui/components/input';

type NavItem = {
  label: string;
  icon: string;
  active?: boolean;
};

type FavoriteProject = {
  name: string;
  color: string;
  icon: string;
};

type StatCard = {
  label: string;
  value: string;
  detail: string;
  progress: number;
  delta: string;
  trend: 'up' | 'down';
};

type Task = {
  name: string;
  project: string;
  projectIcon: string;
  projectColor: string;
  dates: string;
  importance: 'High' | 'Medium' | 'Low';
  completion: number;
};

@Component({
  selector: 'app-root',
  imports: [
    Button,
    Card,
    CardContent,
    Cell,
    CellDef,
    Checkbox,
    ColumnDef,
    FormField,
    HeaderCell,
    HeaderCellDef,
    HeaderRow,
    HeaderRowDef,
    Icon,
    IconPrefix,
    Input,
    Label,
    Navigation,
    NavigationItem,
    NavigationItemIconDirective,
    Paginator,
    ProgressBar,
    Row,
    RowDef,
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
  protected readonly displayedColumns = ['select', 'task', 'project', 'dates', 'importance', 'completion', 'actions'];

  protected readonly navItems = signal<readonly NavItem[]>([
    { label: 'Dashboard', icon: 'fluent:grid-24-regular', active: true },
    { label: 'Projects', icon: 'fluent:briefcase-24-regular' },
    { label: 'Messages', icon: 'fluent:chat-24-regular' },
    { label: 'Calendar', icon: 'fluent:calendar-ltr-24-regular' },
    { label: 'Analytics', icon: 'fluent:chart-multiple-24-regular' },
  ]);

  protected readonly favorites = signal<readonly FavoriteProject[]>([
    { name: 'Primor Project', color: '#c96d35', icon: 'fluent:folder-24-filled' },
    { name: 'Sulivan Project', color: '#4478d9', icon: 'fluent:folder-24-filled' },
    { name: 'Trustworth Project', color: '#2fb599', icon: 'fluent:folder-24-filled' },
  ]);

  protected readonly stats = signal<readonly StatCard[]>([
    {
      label: 'Within target',
      value: '88%',
      detail: '458 of 521',
      progress: 88,
      delta: '15%',
      trend: 'up',
    },
    {
      label: 'Exceeded target',
      value: '12%',
      detail: '63 of 521',
      progress: 12,
      delta: '22%',
      trend: 'up',
    },
    {
      label: 'Below target',
      value: '2%',
      detail: '0 of 521',
      progress: 2,
      delta: '3%',
      trend: 'down',
    },
  ]);

  protected readonly tasks = signal<readonly Task[]>([
    {
      name: 'Design Landing Page',
      project: 'Valhalla Platform',
      projectIcon: 'fluent:calendar-24-filled',
      projectColor: '#376eea',
      dates: '12/01/24 - 12/07/24',
      importance: 'High',
      completion: 60,
    },
    {
      name: 'Plan Weekly Marketing',
      project: 'Bifrost Initiative',
      projectIcon: 'fluent:calendar-24-filled',
      projectColor: '#0c6a83',
      dates: '12/01/24 - 12/07/24',
      importance: 'Low',
      completion: 30,
    },
    {
      name: 'Revamp User Onboarding',
      project: 'Valhalla Platform',
      projectIcon: 'fluent:calendar-24-filled',
      projectColor: '#376eea',
      dates: '12/01/24 - 12/07/24',
      importance: 'High',
      completion: 90,
    },
    {
      name: 'Run User Testing',
      project: 'Jotun Project',
      projectIcon: 'fluent:calendar-24-filled',
      projectColor: '#5b5d5f',
      dates: '12/01/24 - 12/07/24',
      importance: 'Medium',
      completion: 25,
    },
    {
      name: 'Scope New Features',
      project: 'Bifrost Initiative',
      projectIcon: 'fluent:calendar-24-filled',
      projectColor: '#0c6a83',
      dates: '12/01/24 - 12/07/24',
      importance: 'Low',
      completion: 40,
    },
    {
      name: 'Update Style Guide',
      project: 'Jotun Project',
      projectIcon: 'fluent:calendar-24-filled',
      projectColor: '#5b5d5f',
      dates: '12/01/24 - 12/07/24',
      importance: 'Medium',
      completion: 75,
    },
    {
      name: 'Restructure Navigation',
      project: 'Bifrost Initiative',
      projectIcon: 'fluent:calendar-24-filled',
      projectColor: '#cfd2d5',
      dates: '12/01/24 - 12/07/24',
      importance: 'Low',
      completion: 10,
    },
    {
      name: 'Refactor Old Code',
      project: 'Jotun Project',
      projectIcon: 'fluent:calendar-24-filled',
      projectColor: '#5b5d5f',
      dates: '12/01/24 - 12/07/24',
      importance: 'Medium',
      completion: 50,
    },
  ]);

}
