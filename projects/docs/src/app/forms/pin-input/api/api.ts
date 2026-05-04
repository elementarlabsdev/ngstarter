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
      name: 'length',
      description: 'Number of inputs',
      type: 'number',
      default: '4'
    },
    {
      name: 'placeholder',
      description: 'Custom placeholder for an input inside the field',
      type: 'string',
      default: '–'
    },
    {
      name: 'acceptOnly',
      description: 'Regexp which restricts input to input',
      type: 'RegExp',
      default: '/^[0-9]+$/'
    },
    {
      name: 'disabled',
      description: 'Disable control',
      type: 'boolean',
      default: 'false'
    }
  ];
}
