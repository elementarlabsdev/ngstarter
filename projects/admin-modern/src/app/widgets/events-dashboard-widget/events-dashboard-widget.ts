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
import { DashboardWidgetContent } from '../shared/widget-content';
import { WidgetShell } from '../shared/widget-shell';

interface ResearchSignalRow {
  readonly signal: string;
  readonly source: string;
  readonly priority: string;
  readonly owner: string;
  readonly tone: 'warm' | 'green' | 'blue';
}

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

  protected readonly signalColumns = ['signal', 'source', 'priority', 'owner', 'action'];
  protected readonly signals: readonly ResearchSignalRow[] = [
    { signal: 'Pricing confusion', source: 'Support chat', priority: 'High', owner: 'Mira', tone: 'warm' },
    { signal: 'Template request', source: 'Beta survey', priority: 'Medium', owner: 'Anton', tone: 'blue' },
    { signal: 'Proof gap', source: 'Sales call', priority: 'High', owner: 'Lena', tone: 'warm' },
    { signal: 'Setup praise', source: 'Onboarding poll', priority: 'Low', owner: 'Noah', tone: 'green' },
    { signal: 'Export friction', source: 'Session replay', priority: 'Medium', owner: 'Iris', tone: 'blue' },
    { signal: 'Tone mismatch', source: 'Brand QA', priority: 'High', owner: 'Sasha', tone: 'warm' },
    { signal: 'Mobile interest', source: 'Community post', priority: 'Medium', owner: 'Theo', tone: 'blue' },
    { signal: 'Workflow win', source: 'Customer note', priority: 'Low', owner: 'Priya', tone: 'green' },
  ];
}
