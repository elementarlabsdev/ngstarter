import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  Card,
  CardAside,
  CardContent,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from '@ngstarter-ui/components/card';
import { Chip } from '@ngstarter-ui/components/chips';
import { Icon } from '@ngstarter-ui/components/icon';
import { MchartLine } from '@ngstarter-ui/components/micro-chart';
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

type WidgetKind = 'map' | 'gauge' | 'calendar' | 'line' | 'events' | 'activity';

interface DashboardWidgetContent {
  readonly kind: WidgetKind;
  readonly title: string;
  readonly subtitle: string;
  readonly value?: number;
}

interface CalendarDay {
  readonly day: string;
  readonly state?: 'active' | 'muted';
  readonly marker?: 'green' | 'rose' | 'blue';
}

interface EventRow {
  readonly type: string;
  readonly id: string;
  readonly date: string;
  readonly time: string;
  readonly tone: 'warm' | 'green' | 'blue';
}

@Component({
  selector: 'app-modern-dashboard-widget',
  imports: [
    Button,
    Card,
    CardAside,
    CardContent,
    CardHeader,
    CardSubtitle,
    CardTitle,
    Cell,
    CellDef,
    Chip,
    ColumnDef,
    HeaderCell,
    HeaderCellDef,
    HeaderRow,
    HeaderRowDef,
    Icon,
    MchartLine,
    Row,
    RowDef,
    Table,
    Tooltip,
  ],
  templateUrl: './modern-dashboard-widget.html',
  styleUrl: './modern-dashboard-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModernDashboardWidget {
  readonly id = input.required<string>();
  readonly content = input.required<DashboardWidgetContent>();

  protected readonly eventColumns = ['type', 'id', 'date', 'time', 'action'];
  protected readonly lineData = [14, 11, 15, 13, 18, 22, 19, 16, 21, 24, 20, 23];
  protected readonly calendarDays: readonly CalendarDay[] = [
    { day: '1', marker: 'green' },
    { day: '2' },
    { day: '3' },
    { day: '4' },
    { day: '5', marker: 'rose' },
    { day: '6' },
    { day: '7', state: 'muted' },
    { day: '8' },
    { day: '9', marker: 'green' },
    { day: '10' },
    { day: '11', state: 'active' },
    { day: '12' },
    { day: '13', state: 'muted' },
    { day: '14', state: 'muted' },
    { day: '15' },
    { day: '16', marker: 'blue' },
    { day: '17' },
    { day: '18', marker: 'green' },
    { day: '19' },
    { day: '20', state: 'muted' },
    { day: '21', state: 'muted' },
    { day: '22', marker: 'rose' },
    { day: '23' },
    { day: '24' },
    { day: '25' },
    { day: '26' },
    { day: '27', marker: 'rose' },
    { day: '28', state: 'muted' },
    { day: '29', marker: 'green' },
    { day: '30' },
    { day: '31' },
    { day: '1', state: 'muted' },
    { day: '2', state: 'muted' },
    { day: '3', state: 'muted' },
    { day: '4', state: 'muted' },
  ];

  protected readonly events: readonly EventRow[] = [
    { type: 'Team assist', id: '1729408', date: '12/11/23', time: '12:00 am', tone: 'warm' },
    { type: 'Shelf pickup', id: '1729416', date: '12/11/23', time: '12:00 am', tone: 'green' },
    { type: 'Dwell spike', id: '1729442', date: '12/11/23', time: '12:00 am', tone: 'blue' },
    { type: 'Shelf pickup', id: '1729488', date: '12/11/23', time: '12:00 am', tone: 'green' },
    { type: 'Team assist', id: '1729501', date: '12/11/23', time: '12:00 am', tone: 'warm' },
    { type: 'Shelf pickup', id: '1729539', date: '12/11/23', time: '12:00 am', tone: 'green' },
  ];
}
