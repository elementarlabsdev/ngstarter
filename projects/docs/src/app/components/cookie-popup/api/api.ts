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
      name: 'cookiePolicyUrl',
      description: 'URL to the cookie policy page',
      type: 'string',
      default: "''"
    },
    {
      name: 'visible',
      description: 'Whether the cookie popup is visible',
      type: 'boolean',
      default: 'true'
    }
  ];

  events = [
    {
      name: 'cookieAccepted',
      description: "Emitted when user accepts cookies. Returns 'all' or 'necessary'"
    }
  ];
}
