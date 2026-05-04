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
      description: 'The list of date formats to display in the select.',
      type: 'DateFormat[]',
      default: "[{ value: 'MM/dd/yyyy', name: 'MM/DD/YYYY' }, { value: 'dd.MM.yyyy', name: 'DD.MM.YYYY' }, { value: 'yyyy-MM-dd', name: 'YYYY-MM-DD' }]"
    },
    {
      name: 'placeholder',
      description: 'The placeholder text to display when no value is selected.',
      type: 'string',
      default: "''"
    },
    {
      name: 'required',
      description: 'Whether the select is required.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the select is disabled.',
      type: 'boolean',
      default: 'false'
    }
  ];
}
