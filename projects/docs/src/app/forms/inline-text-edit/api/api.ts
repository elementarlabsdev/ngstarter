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
      name: 'enabled',
      description: 'Whether the component is enabled for editing',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'placeholder',
      description: 'The placeholder text to display when the content is empty',
      type: 'string',
      default: '\'\''
    },
    {
      name: 'delay',
      description: 'The delay in milliseconds before emitting the contentChanged event',
      type: 'number',
      default: '0'
    }
  ];
  events = [
    {
      name: 'contentChanged',
      description: 'Emitted when the content has been changed and confirmed (on blur or enter)'
    }
  ];
}
