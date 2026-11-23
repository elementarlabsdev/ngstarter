import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
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
    },
    { name: 'value', description: 'PIN model. Accepts an initial string or number and emits a number or null for user edits.', type: 'number | string | null', default: 'null' },
    { name: 'readonly', description: 'Prevents user edits while keeping the value visible.', type: 'boolean', default: 'false' },
  ];
}
