import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
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
      name: 'minWidth',
      description: 'Minimum width of the crop selection',
      type: 'number',
      default: '100'
    },
    {
      name: 'minHeight',
      description: 'Minimum height of the crop selection',
      type: 'number',
      default: '100'
    },
    {
      name: 'shape',
      description: 'Shape of the crop selection',
      type: "'rectangle' | 'circle'",
      default: "'rectangle'"
    }
  ];

  events = [
    {
      name: 'selectionApplied',
      description: 'Emitted when the crop selection is changed or initialized',
      type: 'CropSelection'
    }
  ];
}
