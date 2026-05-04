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
      name: 'config<sup>*</sup>',
      description: 'Configuration for the form, including elements, layout, and validators',
      type: 'FormConfig',
      default: '–'
    },
    {
      name: 'initialValue',
      description: 'Initial values for the form fields',
      type: 'Record<string, any>',
      default: 'undefined'
    }
  ];

  events = [
    {
      name: 'formSubmit',
      description: 'Emitted when the form is submitted and valid',
      type: 'any'
    },
    {
      name: 'valueChanges',
      description: 'Emitted when the form value changes',
      type: 'any'
    },
    {
      name: 'initialized',
      description: 'Emitted when the form is fully initialized and controls are created',
      type: 'void'
    }
  ];
}
