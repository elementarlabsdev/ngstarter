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
  layoutProperties = [
    {
      name: 'layoutId',
      description: 'Unique identifier for the layout',
      type: 'string',
      default: 'layout-n'
    },
    {
      name: 'root',
      description: 'Whether this is the root layout',
      type: 'boolean',
      default: 'false'
    }
  ];

  contentProperties = [
    {
      name: 'autoscrollToTop',
      description: 'Whether to automatically scroll to top on navigation',
      type: 'boolean',
      default: 'true'
    }
  ];
}
