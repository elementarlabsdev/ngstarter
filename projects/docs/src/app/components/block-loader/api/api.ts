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
      name: 'loading',
      description: 'Show/Hide block loader',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'spinnerDiameter',
      description: 'Set spinner diameter',
      type: 'number',
      default: '48'
    },
    {
      name: 'spinnerStrokeWidth',
      description: 'Set spinner stroke width',
      type: 'number',
      default: '4'
    }
  ];

  directives = [
    {
      name: '<code>ngsBlockLoaderContainer</code>',
      description: 'Directive to mark a container for block loader positioning (sets relative position)'
    }
  ];
}
