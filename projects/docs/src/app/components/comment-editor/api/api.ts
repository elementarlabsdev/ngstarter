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
import { Divider } from '@ngstarter-ui/components/divider';

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
    Row,
    Divider
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss',
})
export class Api {
  properties = [
    {
      name: 'contentMaxHeight',
      description: 'Maximum height of the content area in pixels.',
      type: 'number',
      default: '–'
    },
    {
      name: 'buttonCancelLabel',
      description: 'Label for the cancel button.',
      type: 'string',
      default: 'Cancel'
    },
    {
      name: 'buttonSendLabel',
      description: 'Label for the send button.',
      type: 'string',
      default: 'Send'
    },
    {
      name: 'placeholder',
      description: 'Placeholder text for the editor.',
      type: 'string',
      default: 'Write something …'
    },
    {
      name: 'toolbarAlwaysVisible',
      description: 'Whether the toolbar should always be visible.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'fullViewMode',
      description: 'Whether the editor should be in full view mode by default.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'cancelButtonAlwaysVisible',
      description: 'Whether the cancel button should always be visible.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'imageUploadFn',
      description: 'Function to handle image uploads.',
      type: '(file: Blob) => Promise<string>',
      default: '–'
    }
  ];

  outputs = [
    {
      name: 'sent',
      description: 'Event emitted when the send button is clicked. Emits the HTML content.',
      type: 'string'
    },
    {
      name: 'canceled',
      description: 'Event emitted when the cancel button is clicked.',
      type: 'void'
    }
  ];
}
