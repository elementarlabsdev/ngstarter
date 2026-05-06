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
      name: 'disabled',
      description: 'Whether the expansion panel is disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'expanded',
      description: 'Whether the expansion panel is expanded.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'hideToggle',
      description: 'Whether to hide the expansion indicator.',
      type: 'boolean',
      default: 'false'
    }
  ];
  events = [
    {
      name: 'opened',
      description: 'Event emitted when the panel is opened.'
    },
    {
      name: 'closed',
      description: 'Event emitted when the panel is closed.'
    },
    {
      name: 'expandedChange',
      description: 'Event emitted when the panel expansion state changes.'
    }
  ];
}
