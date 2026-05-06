import { Component } from '@angular/core';
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
      name: 'vertical',
      description: 'Whether the divider is vertically aligned.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'inset',
      description: 'Whether the divider is an inset divider.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'fixedHeight',
      description: 'Whether the divider has a fixed height.',
      type: 'boolean',
      default: 'false'
    }
  ];
}
