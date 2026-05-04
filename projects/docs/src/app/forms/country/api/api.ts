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
      name: 'placeholder',
      description: 'The placeholder text for the input.',
      type: 'string',
      default: "''"
    },
    {
      name: 'required',
      description: 'Whether the input is required.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the input is disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'showCountryCode',
      description: 'Whether to show the country code in the trigger.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'searchTerm',
      description: 'The search term for filtering countries.',
      type: 'string',
      default: "''"
    }
  ];
  events = [
    {
      name: 'opened',
      description: 'Event emitted when the select panel is opened.'
    },
    {
      name: 'closed',
      description: 'Event emitted when the select panel is closed.'
    }
  ];
}
