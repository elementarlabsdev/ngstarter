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
      name: 'value',
      description: 'Shows the percentage progress',
      type: 'number',
      default: '0'
    },
    {
      name: 'strokeWidth',
      description: 'Stroke width',
      type: 'number',
      default: '10'
    },
    {
      name: 'radius',
      description: 'Radius',
      type: 'number',
      default: '50'
    }
  ];
}
