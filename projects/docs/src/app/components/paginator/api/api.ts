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
      name: 'pageIndex',
      description: 'The zero-based page index of the displayed list of items. Defaulted to 0.',
      type: 'number',
      default: '0'
    },
    {
      name: 'length',
      description: 'The length of the total number of items that are being paginated. Defaulted to 0.',
      type: 'number',
      default: '0'
    },
    {
      name: 'pageSize',
      description: 'Number of items to display on a page. By default set to 50.',
      type: 'number',
      default: '50'
    },
    {
      name: 'pageSizeOptions',
      description: 'The set of provided page size options to display to the user.',
      type: 'number[]',
      default: '[]'
    },
    {
      name: 'hidePageSize',
      description: 'Whether to hide the page size selection UI from the user.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'showFirstLastButtons',
      description: 'Whether to show the first/last buttons UI to the user.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the paginator is disabled.',
      type: 'boolean',
      default: 'false'
    }
  ];
  events = [
    {
      name: 'page',
      description: 'Event emitted when the paginator changes the page size or page index.'
    }
  ];
}
