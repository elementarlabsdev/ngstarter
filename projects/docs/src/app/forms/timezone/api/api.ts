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
      name: 'value',
      description: 'The selected IANA time zone id',
      type: 'string | null',
      default: 'null'
    },
    {
      name: 'placeholder',
      description: 'The placeholder text for the closed select trigger',
      type: 'string',
      default: "''"
    },
    {
      name: 'required',
      description: 'Whether the select is required',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the select is disabled',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'locale',
      description: 'The locale used for timezone list formatting',
      type: 'string',
      default: 'inject(LOCALE_ID)'
    },
    {
      name: 'aria-describedby',
      description: 'The aria-describedby attribute for the select',
      type: 'string',
      default: "''"
    },
    { name: 'readonly', description: 'Prevents user edits while keeping the value visible.', type: 'boolean', default: 'false' },
    { name: 'invalid', description: 'Invalid state supplied by the bound form field.', type: 'boolean', default: 'false' },
    { name: 'touched', description: 'Touched state supplied by the bound form field.', type: 'boolean', default: 'false' },
  ];

  events = [
    {
      name: 'opened',
      description: 'Emitted when the select panel is opened'
    },
    {
      name: 'closed',
      description: 'Emitted when the select panel is closed'
    },
    { name: 'valueChange', description: 'Emits the new value when the control updates its model.', type: 'string | null' },
    { name: 'touch', description: 'Reports when focus leaves the control.', type: 'void' },
  ];
}
