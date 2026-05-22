import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef, HeaderRow,
  HeaderRowDef, Row,
  RowDef,
  Table
} from '@ngstarter-ui/components/table';

@Component({
  selector: 'app-api',
  imports: [
    Table,
    HeaderCellDef,
    HeaderCell,
    Cell,
    CellDef,
    ColumnDef,
    HeaderRowDef,
    RowDef,
    HeaderRow,
    Row
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss',
})
export class Api {
  properties = [
    {
      name: 'adaptive',
      description: 'Enables adaptive mode',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'adaptiveBreakpoint',
      description: 'Breakpoint for adaptive mode',
      type: 'string',
      default: '(max-width: 991.98px)'
    },
    {
      name: 'opened',
      description: 'Sidenav open state',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'fixedWidth',
      description: 'Fixed sidenav width',
      type: 'number | string | null',
      default: 'null'
    },
    {
      name: 'mode',
      description: 'Display mode (\'over\', \'push\', \'side\')',
      type: 'SidenavMode',
      default: 'over'
    },
    {
      name: 'position',
      description: 'Sidenav position (\'start\', \'end\')',
      type: 'SidenavPosition',
      default: 'start'
    },
    {
      name: 'collapsed',
      description: 'Sidenav collapsed state',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disableClose',
      description: 'Disables closing the sidenav',
      type: 'boolean',
      default: 'false'
    }
  ];

  events = [
    {
      name: 'openedChange',
      description: 'Event emitted when the open state changes'
    }
  ];
}
