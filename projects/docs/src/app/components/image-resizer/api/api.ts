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
      name: 'imageMaxWidth',
      description: 'Maximum width of the image',
      type: 'number',
      default: 'null'
    },
    {
      name: 'imageMinWidth',
      description: 'Minimum width of the image',
      type: 'number',
      default: '100'
    }
  ];
  events = [
    {
      name: 'imageResized',
      description: 'Emitted when the image dimensions change'
    }
  ];
}
