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
      name: 'id',
      description: 'Unique identifier for the input',
      type: 'string',
      default: 'ngs-input-n'
    },
    {
      name: 'placeholder',
      description: 'Placeholder text for the input',
      type: 'string',
      default: '""'
    },
    {
      name: 'required',
      description: 'Whether the input is required',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the input is disabled',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'readonly',
      description: 'Whether the input is readonly',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'errorStateMatcher',
      description: 'Object used to control when error messages are shown',
      type: 'ErrorStateMatcher',
      default: '–'
    },
    {
      name: 'value',
      description: 'Value of the input',
      type: 'string',
      default: '""'
    }
  ];
}
