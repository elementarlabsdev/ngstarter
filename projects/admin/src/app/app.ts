import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import {
  cellRenderer,
  DataView,
  DataViewActionBar,
  DataViewActionBarDirective,
  DataViewCellRendererDef,
  DataViewColumnDef,
} from '@ngstarter-ui/components/data-view';
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
  selector: 'app-task-project-cell',
  imports: [Icon],
  template: `
    <div class="flex items-center gap-2.5 font-normal text-[#1f2329]">
      <span
        class="inline-grid size-6 flex-none place-items-center rounded-[0.38rem] text-white"
        [style.background]="element()?.projectColor"
      >
        <ngs-icon [name]="element()?.projectIcon ?? ''" />
      </span>
      <span class="truncate">{{ element()?.project }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TaskProjectCellRenderer {
  readonly element = input<Task>();
  readonly columnDef = input<DataViewColumnDef>();
  readonly fieldData = input<string>();
}

@Component({
  selector: 'app-task-importance-cell',
  template: `
    <span
      class="inline-flex min-h-7 items-center rounded-lg px-3 text-[0.84rem] font-normal"
      [style.color]="color()"
      [style.background]="background()"
    >
      <span class="mr-2 size-1.5 rounded-full" [style.background]="color()"></span>
      {{ fieldData() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TaskImportanceCellRenderer {
  readonly element = input<Task>();
  readonly columnDef = input<DataViewColumnDef>();
  readonly fieldData = input<Task['importance']>();

  protected color(): string {
    switch (this.fieldData()) {
      case 'Medium':
        return '#cf7b3a';
      case 'Low':
        return '#4b83df';
      default:
        return '#c34d69';
    }
  }

  protected background(): string {
    switch (this.fieldData()) {
      case 'Medium':
        return '#fff7ef';
      case 'Low':
        return '#f2f7ff';
      default:
        return '#fff4f6';
    }
  }
}

@Component({
  selector: 'app-task-completion-cell',
  imports: [ProgressBar],
  template: `
    <div class="flex w-full items-center gap-2">
      <ngs-progress-bar [value]="fieldData() ?? 0" />
      <span class="w-8 text-right font-normal text-[#3e444c]">{{ fieldData() }}%</span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    ngs-progress-bar {
      --ngs-progress-bar-height: 0.375rem;
      --ngs-progress-bar-indicator-color: var(--admin-teal);
      --ngs-progress-bar-track-color: #ececef;
      flex: 1 1 auto;
      min-width: 3rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TaskCompletionCellRenderer {
  readonly element = input<Task>();
  readonly columnDef = input<DataViewColumnDef>();
  readonly fieldData = input<number>();
}

@Component({
  selector: 'app-root',
  imports: [
    Button,
    Card,
    CardContent,
    DataView,
    DataViewActionBar,
    DataViewActionBarDirective,
    FormField,
    Icon,
    IconPrefix,
    Input,
    Label,
    Navigation,
    NavigationItem,
    NavigationItemIconDirective,
    Paginator,
    ProgressBar,
    Sidenav,
    SidenavContainer,
    SidenavContent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly taskSearch = signal('');

  protected readonly taskColumnDefs: DataViewColumnDef[] = [
    {
      name: 'Task',
      field: 'name',
      visible: true,
      flex: 1.45,
      sortable: true,
      resizable: true,
    },
    {
      name: 'Related Project',
      field: 'project',
      cellRenderer: 'project',
      visible: true,
      flex: 1.3,
      sortable: true,
      resizable: true,
    },
    {
      name: 'Time Allotment',
      field: 'dates',
      visible: true,
      flex: 1.25,
      sortable: true,
      resizable: true,
    },
    {
      name: 'Importance',
      field: 'importance',
      cellRenderer: 'importance',
      visible: true,
      flex: 0.85,
      sortable: true,
      resizable: true,
    },
    {
      name: 'Completion',
      field: 'completion',
      cellRenderer: 'completion',
      visible: true,
      flex: 1.15,
      sortable: true,
      resizable: true,
    },
  ];

  protected readonly taskCellRenderers: DataViewCellRendererDef[] = [
    cellRenderer('project', () => Promise.resolve(TaskProjectCellRenderer)),
    cellRenderer('importance', () => Promise.resolve(TaskImportanceCellRenderer)),
    cellRenderer('completion', () => Promise.resolve(TaskCompletionCellRenderer)),
  ];

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

  protected readonly tasks = signal<Task[]>([
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
