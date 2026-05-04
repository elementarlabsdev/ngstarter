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
    }
  ];
  events = [
    {
      name: 'opened',
      description: 'Event emitted when the currency select panel is opened.'
    },
    {
      name: 'closed',
      description: 'Event emitted when the currency select panel is closed.'
    }
  ];
}
