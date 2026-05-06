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
      name: 'isOpen',
      description: 'Whether the drawer is open.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'showBackdrop',
      description: 'Whether the drawer should show a backdrop.',
      type: 'boolean',
      default: 'true'
    }
  ];
  events = [
    {
      name: 'opened',
      description: 'Event emitted when the drawer has been opened.'
    },
    {
      name: 'closed',
      description: 'Event emitted when the drawer has been closed.'
    }
  ];
}
