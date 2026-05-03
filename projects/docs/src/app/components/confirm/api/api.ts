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
      name: 'title<sup>*</sup>',
      description: 'The title of the confirmation dialog',
      type: 'string',
      default: '–'
    },
    {
      name: 'description<sup>*</sup>',
      description: 'The descriptive text shown in the dialog',
      type: 'string',
      default: '–'
    }
  ];

  methods = [
    {
      name: 'open(options: ConfirmOptions)',
      description: 'Opens the confirmation dialog with the specified options',
      returnType: 'ConfirmRef'
    }
  ];

  events = [
    {
      name: 'confirmed',
      description: 'Emitted when the user confirms the action',
      type: 'EventEmitter<void>'
    },
    {
      name: 'canceled',
      description: 'Emitted when the user cancels the action',
      type: 'EventEmitter<void>'
    },
    {
      name: 'closed',
      description: 'Emitted when the dialog is closed',
      type: 'EventEmitter<void>'
    }
  ];
}
