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
      name: 'placeholder',
      description: 'The placeholder for the currency select input.',
      type: 'string',
      default: "''"
    },
    {
      name: 'required',
      description: 'Whether the currency select is required.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the currency select is disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'showCountryName',
      description: 'Whether to show the country name in the select options.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'searchTerm',
      description: 'The current search term used to filter currencies.',
      type: 'string',
      default: "''"
    },
    { name: 'value', description: 'Selected ISO currency code.', type: 'string | null', default: 'null' },
    { name: 'readonly', description: 'Prevents user edits while keeping the value visible.', type: 'boolean', default: 'false' },
    { name: 'invalid', description: 'Invalid state supplied by the bound form field.', type: 'boolean', default: 'false' },
    { name: 'touched', description: 'Touched state supplied by the bound form field.', type: 'boolean', default: 'false' },
  ];
  events = [
    {
      name: 'opened',
      description: 'Event emitted when the currency select panel is opened.'
    },
    {
      name: 'closed',
      description: 'Event emitted when the currency select panel is closed.'
    },
    { name: 'valueChange', description: 'Emits the new value when the control updates its model.', type: 'string | null' },
    { name: 'touch', description: 'Reports when focus leaves the control.', type: 'void' },
  ];
}
