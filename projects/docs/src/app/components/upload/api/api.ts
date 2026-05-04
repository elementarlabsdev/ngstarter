import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
  RowDef,
  Table
} from '@ngstarter-ui/components/table';

@Component({
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
  uploadAreaProperties = [
    {
      name: 'allowHover',
      description: 'Whether to allow hover state',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'multiple',
      description: 'Whether to allow multiple files',
      type: 'boolean',
      default: 'false'
    }
  ];

  fileProperties = [
    {
      name: 'size',
      description: 'The size of the file',
      type: 'number',
      default: 'undefined'
    },
    {
      name: 'progress',
      description: 'The upload progress (0-100)',
      type: 'number',
      default: '0'
    },
    {
      name: 'progressingMessage',
      description: 'The message to show during progress',
      type: 'string',
      default: 'undefined'
    },
    {
      name: 'errorMessage',
      description: 'The error message to show',
      type: 'string',
      default: 'undefined'
    },
    {
      name: 'remainingTime',
      description: 'The remaining time for the upload',
      type: 'string',
      default: 'undefined'
    }
  ];

  uploadTriggerProperties = [
    {
      name: 'multiple',
      description: 'Whether to allow multiple files',
      type: 'boolean',
      default: 'false'
    }
  ];

  events = [
    {
      name: 'fileSelected',
      description: 'Emitted when a file is selected'
    }
  ];
}
