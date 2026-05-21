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
    { type: 'Voice approved', id: 'CS-2408', date: '10/08/26', time: '09:10 am', tone: 'green' },
    { type: 'Image flagged', id: 'CS-2416', date: '10/08/26', time: '09:25 am', tone: 'warm' },
    { type: 'Copy revised', id: 'CS-2442', date: '10/08/26', time: '09:40 am', tone: 'blue' },
    { type: 'Post scheduled', id: 'CS-2488', date: '10/08/26', time: '10:05 am', tone: 'green' },
    { type: 'Legal check', id: 'CS-2501', date: '10/08/26', time: '10:18 am', tone: 'warm' },
    { type: 'Asset exported', id: 'CS-2539', date: '10/08/26', time: '10:40 am', tone: 'green' },
  ];
}
