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
      name: 'color',
      description: 'Custom color for the fade gradient',
      type: 'string',
      default: '–'
    },
    {
      name: 'width',
      description: 'Custom width for the fade effect',
      type: 'string',
      default: '–'
    },
    {
      name: 'position',
      description: 'Position of the fade effect',
      type: "'both' | 'start' | 'end'",
      default: 'both'
    }
  ];
}
