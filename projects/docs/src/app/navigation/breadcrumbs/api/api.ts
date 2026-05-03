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
      name: 'dataSource',
      description: 'The data source to be used for the breadcrumbs.',
      type: 'T[]',
      default: '[]'
    },
    {
      name: 'lastItemAsLink',
      description: 'Whether the last item should be displayed as a link.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'separator',
      description: 'Separator between breadcrumb items.',
      type: 'string',
      default: '/'
    }
  ];
}
