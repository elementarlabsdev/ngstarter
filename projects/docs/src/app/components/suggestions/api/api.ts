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
      name: 'heading',
      description: 'The heading text for the suggestion block',
      type: 'string',
      default: '–'
    },
    {
      name: 'showDivider',
      description: 'Whether to show a divider after the suggestion block',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'inline',
      description: 'Whether the suggestion block should be displayed inline',
      type: 'boolean',
      default: 'false'
    }
  ];
}
