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
import { Divider } from '@ngstarter-ui/components/divider';

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
    Row,
    Divider
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss',
})
export class Api {
  properties = [
    {
      name: 'autoClose',
      description: 'Number of milliseconds to auto-close',
      type: 'number',
      default: '–'
    },
    {
      name: 'bordered',
      description: 'Bordered variant of an alert',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'variant',
      description: 'Colored variant of an alert',
      type: 'AlertVariant | string',
      default: 'default'
    }
  ];
  events = [
    {
      name: 'closed',
      description: 'Executed when the alert closes'
    }
  ];
}
