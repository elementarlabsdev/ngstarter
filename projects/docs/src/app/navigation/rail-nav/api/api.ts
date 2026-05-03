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
  railNavProperties = [
    {
      name: 'activeKey',
      description: 'The key of the active rail nav item',
      type: 'any',
      default: 'undefined'
    }
  ];

  railNavItemProperties = [
    {
      name: 'key',
      description: 'The unique key of the rail nav item',
      type: 'any',
      default: 'uuid()'
    }
  ];
}
