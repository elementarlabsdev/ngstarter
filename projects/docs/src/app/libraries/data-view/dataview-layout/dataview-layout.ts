import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import { Button } from '@ngstarter-ui/components/button';
import {
  cellRenderer,
  DataView,
  DataViewCellRendererDef,
  DataViewColumnDef
} from '@ngstarter-ui/components/data-view';
import { FormField, IconPrefix } from '@ngstarter-ui/components/form-field';
import { Icon } from '@ngstarter-ui/components/icon';
import { Input } from '@ngstarter-ui/components/input';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { PageEvent, Paginator } from '@ngstarter-ui/components/paginator';
import { Panel, PanelContent, PanelFooter, PanelHeader } from '@ngstarter-ui/components/panel';
import {
  FilterTrigger,
  FilterTriggerValueDirective,
  Option,
  Select
} from '@ngstarter-ui/components/select';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { STAFF_MEMBERS, STAFF_STATUSES, StaffMember, StaffStatus } from './staff-data';
import {PanelSubheader} from "@ngstarter-ui/components/panel/src/panel-subheader/panel-subheader";
import {Toolbar, ToolbarSpacer} from "@ngstarter-ui/components/toolbar";

@Component({
  selector: 'app-dataview-layout',
  imports: [
    Button,
    DataView,
    FilterTrigger,
    FilterTriggerValueDirective,
    FormField,
    Icon,
    IconPrefix,
    Input,
    Menu,
    MenuItem,
    MenuTrigger,
    Option,
    Paginator,
    Panel,
    PanelContent,
    PanelFooter,
    PanelHeader,
    ReactiveFormsModule,
    Select,
    PanelSubheader,
    Toolbar,
    ToolbarSpacer
  ],
  templateUrl: './dataview-layout.html',
  styleUrl: './dataview-layout.scss'
})
export class DataViewLayout {
  readonly staffTypes = signal(['Permanent staff', 'Contractors', 'Hourly staff', 'Interns']);
  readonly positions = signal(['General Manager', 'Room Cleaner', 'Front Desk', 'Designer', 'Marketing Manager', 'Office Manager']);
  readonly statuses = signal(STAFF_STATUSES);
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);

  readonly staffType = signal(new FormControl<string | null>(null));
  readonly position = signal(new FormControl<string | null>(null));
  readonly status = signal(new FormControl<StaffStatus['id'][]>([], { nonNullable: true }));
  readonly search = signal(new FormControl('', { nonNullable: true }));

  private readonly staffTypeValue = toSignal(
    this.staffType().valueChanges.pipe(startWith(this.staffType().value)),
    { initialValue: this.staffType().value }
  );
  private readonly positionValue = toSignal(
    this.position().valueChanges.pipe(startWith(this.position().value)),
    { initialValue: this.position().value }
  );
  private readonly statusValue = toSignal(
    this.status().valueChanges.pipe(startWith(this.status().value)),
    { initialValue: this.status().value }
  );
  readonly searchValue = toSignal(
    this.search().valueChanges.pipe(startWith(this.search().value)),
    { initialValue: this.search().value }
  );

  readonly columnDefs = signal<DataViewColumnDef[]>([
    {
      name: 'Staff ID',
      field: 'id',
      width: '112px',
      sortable: true
    },
    {
      name: 'Staff Name',
      field: 'name',
      cellRenderer: 'staffName',
      sortable: true
    },
    {
      name: 'Position',
      field: 'position',
      width: '170px',
      sortable: true
    },
    {
      name: 'Hire Date',
      field: 'hireDate',
      width: '142px',
      sortable: true
    },
    {
      name: 'Agreement',
      field: 'agreement',
      width: '112px',
      sortable: true
    },
    {
      name: 'Hire Type',
      field: 'hireType',
      width: '104px',
      sortable: true
    },
    {
      name: 'Salary Rate',
      field: 'salaryRate',
      width: '126px',
      sortable: true
    },
    {
      name: 'Status',
      field: 'status',
      cellRenderer: 'staffStatus',
      width: '160px',
      sortable: true,
      valueGetter: (status: StaffStatus) => status.label
    },
    {
      name: '',
      field: 'actions',
      cellRenderer: 'staffActions',
      width: '80px',
      sortable: false,
      resizable: false,
      withColumnSettings: false,
      pinned: true,
      pinAlign: 'end'
    }
  ]);

  readonly cellRenderers = signal<DataViewCellRendererDef[]>([
    cellRenderer('staffName', () => import('./renderers/staff-name-cell/staff-name-cell.renderer').then(c => c.StaffNameCellRenderer)),
    cellRenderer('staffStatus', () => import('./renderers/staff-status-cell/staff-status-cell.renderer').then(c => c.StaffStatusCellRenderer)),
    cellRenderer('staffActions', () => import('./renderers/staff-actions-cell/staff-actions-cell.renderer').then(c => c.StaffActionsCellRenderer))
  ]);

  readonly staffMembers = signal<StaffMember[]>(STAFF_MEMBERS);
  readonly filteredStaff = computed(() => {
    const query = this.searchValue().trim().toLowerCase();
    const staffType = this.staffTypeValue();
    const position = this.positionValue();
    const statusIds = this.statusValue();

    return this.staffMembers().filter(member => {
      const matchesQuery = !query || [
        member.id,
        member.name,
        member.position,
        member.hireType,
        member.status.label
      ].some(value => value.toLowerCase().includes(query));
      const matchesStaffType = !staffType
        || staffType === 'Permanent staff' && member.hireType === 'Salary'
        || staffType === 'Contractors' && member.hireType === 'Contact'
        || staffType === 'Hourly staff' && member.hireType === 'Hourly'
        || staffType === 'Interns' && member.hireType === 'Intern';
      const matchesPosition = !position || member.position === position;
      const matchesStatus = statusIds.length === 0 || statusIds.includes(member.status.id);

      return matchesQuery && matchesStaffType && matchesPosition && matchesStatus;
    });
  });

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  resetPage(): void {
    this.pageIndex.set(0);
  }
}
