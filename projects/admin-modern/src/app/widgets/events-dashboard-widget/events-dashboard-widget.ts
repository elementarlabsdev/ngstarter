import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Chip } from '@ngstarter-ui/components/chips';
import { Icon } from '@ngstarter-ui/components/icon';
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
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { DashboardWidgetContent, EventRow } from '../shared/widget-content';
import { WidgetShell } from '../shared/widget-shell';

@Component({
  selector: 'app-events-dashboard-widget',
  imports: [
    Button,
    Cell,
    CellDef,
    Chip,
    ColumnDef,
    HeaderCell,
    HeaderCellDef,
    HeaderRow,
    HeaderRowDef,
    Icon,
    Row,
    RowDef,
    Table,
    Tooltip,
    WidgetShell,
  ],
  templateUrl: './events-dashboard-widget.html',
  styleUrl: './events-dashboard-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsDashboardWidget {
  readonly id = input.required<string>();
  readonly content = input.required<DashboardWidgetContent>();

  protected readonly eventColumns = ['type', 'id', 'date', 'time', 'action'];
  protected readonly events: readonly EventRow[] = [
    { type: 'Team assist', id: '1729408', date: '12/11/23', time: '12:00 am', tone: 'warm' },
    { type: 'Shelf pickup', id: '1729416', date: '12/11/23', time: '12:00 am', tone: 'green' },
    { type: 'Dwell spike', id: '1729442', date: '12/11/23', time: '12:00 am', tone: 'blue' },
    { type: 'Shelf pickup', id: '1729488', date: '12/11/23', time: '12:00 am', tone: 'green' },
    { type: 'Team assist', id: '1729501', date: '12/11/23', time: '12:00 am', tone: 'warm' },
    { type: 'Shelf pickup', id: '1729539', date: '12/11/23', time: '12:00 am', tone: 'green' },
  ];
}
