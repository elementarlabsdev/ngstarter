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
    }
  ];

  events = [
    {
      name: 'countryChanged',
      description: 'Executed when a country changed',
      type: 'EventEmitter&lt;Country&gt;'
    }
  ];
}
