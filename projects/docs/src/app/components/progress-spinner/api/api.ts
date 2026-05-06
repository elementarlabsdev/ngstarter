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
      description: 'The color of the progress spinner',
      type: 'string',
      default: 'primary'
    },
    {
      name: 'mode',
      description: 'The mode of the progress spinner (determinate or indeterminate)',
      type: 'SpinnerMode',
      default: 'indeterminate'
    },
    {
      name: 'value',
      description: 'The value of the progress spinner (only for determinate mode)',
      type: 'number',
      default: '0'
    },
    {
      name: 'diameter',
      description: 'The diameter of the progress spinner in pixels',
      type: 'number',
      default: '100'
    },
    {
      name: 'strokeWidth',
      description: 'The stroke width of the progress spinner in pixels',
      type: 'number | undefined',
      default: 'undefined'
    }
  ];
}
