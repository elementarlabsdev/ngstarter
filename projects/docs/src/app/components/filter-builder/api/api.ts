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
      description: 'The current filter value',
      type: 'FilterBuilderGroup[]',
      default: '[]'
    },
    {
      name: 'fieldDefs',
      description: 'Field definitions for filtering',
      type: 'FilterBuilderFieldDef[]',
      default: '[]'
    },
    {
      name: 'categories',
      description: 'Field categories',
      type: 'any[]',
      default: '[]'
    },
    {
      name: 'groupOperations',
      description: 'Operations for grouping conditions (And, Or)',
      type: 'any[]',
      default: "[{id: 'and', name: 'And'}, {id: 'or', name: 'Or'}]"
    },
    {
      name: 'customOperations',
      description: 'Custom filtering operations',
      type: 'any[]',
      default: '[]'
    }
  ];

  events = [
    {
      name: 'valueChanged',
      description: 'Event that occurs when the filter value changes'
    }
  ];
}
