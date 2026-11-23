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
      name: 'autocomplete',
      description: 'Specifies whether autocomplete is applied to an editable text field.',
      type: 'on | off',
      default: 'on'
    },
    {
      name: 'errorStateMatcher',
      description: 'Custom errorStateMatcher',
      type: 'ErrorStateMatcher',
      default: '–'
    },
    {
      name: 'onlyCountries',
      description: 'List of iso codes of available country list',
      type: 'string[]',
      default: '[]'
    },
    {
      name: 'preferredCountries',
      description: 'List of iso codes of available preferred country list',
      type: 'string[]',
      default: '[]'
    },
    {
      name: 'format',
      description: 'Custom phone format',
      type: 'default | national | international',
      default: 'default'
    },
    {
      name: 'defaultSelectedCountryCode',
      description: 'Default selected country code',
      type: 'string',
      default: 'us'
    },
    {
      name: 'placeholder',
      description: 'Input placeholder',
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
    { name: 'value', description: 'Phone number model. Valid numbers are stored in international E.164 format.', type: 'string | null', default: 'null' },
    { name: 'readonly', description: 'Prevents user edits while keeping the value visible.', type: 'boolean', default: 'false' },
    { name: 'invalid', description: 'Invalid state supplied by the bound form field.', type: 'boolean', default: 'false' },
    { name: 'touched', description: 'Touched state supplied by the bound form field.', type: 'boolean', default: 'false' },
  ];

  events = [
    {
      name: 'countryChanged',
      description: 'Executed when a country changed',
      type: 'EventEmitter&lt;Country&gt;'
    },
    { name: 'valueChange', description: 'Emits the new value when the control updates its model.', type: 'string | null' },
    { name: 'touch', description: 'Reports when focus leaves the control.', type: 'void' },
  ];
}
