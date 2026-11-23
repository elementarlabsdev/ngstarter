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
      name: 'aria-label',
      description: 'Accessible name forwarded to the native number input',
      type: 'string | null',
      default: 'null'
    },
    {
      name: 'min',
      description: 'Minimum value of the input',
      type: 'number',
      default: 'undefined'
    },
    {
      name: 'max',
      description: 'Maximum value of the input',
      type: 'number',
      default: 'undefined'
    },
    {
      name: 'step',
      description: 'Step value for increment/decrement',
      type: 'number',
      default: '1'
    },
    {
      name: 'readonly',
      description: 'Whether the input is readonly',
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
      name: 'required',
      description: 'Whether the input is required',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'placeholder',
      description: 'The placeholder text',
      type: 'string',
      default: "''"
    },
    {
      name: 'value',
      description: 'Numeric model. The control writes null when the user clears the input.',
      type: 'number | null | undefined',
      default: 'null'
    },
    { name: 'invalid', description: 'Invalid state supplied by the bound form field.', type: 'boolean', default: 'false' },
    { name: 'touched', description: 'Touched state supplied by the bound form field.', type: 'boolean', default: 'false' },
  ];
  events = [
    {
      name: 'valueChange',
      description: 'Emitted when the value changes'
    },
    { name: 'touch', description: 'Reports when focus leaves the control.', type: 'void' },
  ];
}
