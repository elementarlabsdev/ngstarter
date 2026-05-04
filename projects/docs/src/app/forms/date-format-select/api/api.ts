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
      name: 'dateFormats',
      description: 'List of available date formats',
      type: 'DateFormat[]',
      default: "[{ value: 'MM/dd/yyyy', name: 'MM/DD/YYYY' }, ...]"
    },
    {
      name: 'placeholder',
      description: 'The placeholder for the input',
      type: 'string',
      default: "''"
    },
    {
      name: 'required',
      description: 'Whether the field is required',
      type: 'boolean | string',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the field is disabled',
      type: 'boolean | string',
      default: 'false'
    }
  ];
}
