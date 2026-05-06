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
  listProperties = [
    {
      name: 'disabled',
      description: 'Whether the list is disabled',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disableRipple',
      description: 'Whether ripples are disabled',
      type: 'boolean',
      default: 'false'
    }
  ];

  listItemProperties = [
    {
      name: 'disabled',
      description: 'Whether the list item is disabled',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'lines',
      description: 'Number of lines of text to display',
      type: 'number',
      default: 'null'
    },
    {
        name: 'disableRipple',
        description: 'Whether ripples are disabled for this item',
        type: 'boolean',
        default: 'false'
    }
  ];

  selectionListProperties = [
    {
        name: 'multiple',
        description: 'Whether the selection list allows multiple selection',
        type: 'boolean',
        default: 'false'
    },
    {
        name: 'disabled',
        description: 'Whether the selection list is disabled',
        type: 'boolean',
        default: 'false'
    }
  ];

  selectionListEvents = [
    {
        name: 'selectionChange',
        description: 'Event emitted when the selection changes'
    }
  ];

  listOptionProperties = [
    {
        name: 'selected',
        description: 'Whether the option is selected',
        type: 'boolean',
        default: 'false'
    },
    {
        name: 'value',
        description: 'The value associated with the option',
        type: 'any',
        default: 'undefined'
    },
    {
        name: 'disabled',
        description: 'Whether the option is disabled',
        type: 'boolean',
        default: 'false'
    }
  ];

  listOptionEvents = [
    {
        name: 'selectedChange',
        description: 'Event emitted when the option selection state changes'
    }
  ];
}
