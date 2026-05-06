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
      name: 'contentMaxHeight',
      description: 'Maximum height of the content area',
      type: 'number',
      default: '–'
    },
    {
      name: 'buttonCancelLabel',
      description: 'Label for the cancel button',
      type: 'string',
      default: 'Cancel'
    },
    {
      name: 'buttonSendLabel',
      description: 'Label for the send button',
      type: 'string',
      default: 'Send'
    },
    {
      name: 'placeholder',
      description: 'Placeholder text',
      type: 'string',
      default: 'Write something …'
    },
    {
      name: 'toolbarAlwaysVisible',
      description: 'Whether the toolbar is always visible',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'fullViewMode',
      description: 'Whether the editor is in full view mode',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'cancelButtonAlwaysVisible',
      description: 'Whether the cancel button is always visible',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'allowEmptyContent',
      description: 'Whether to allow sending empty content',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'autoClear',
      description: 'Whether to automatically clear the editor after sending',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'loading',
      description: 'Whether the editor is in a loading state',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'imageUploadFn',
      description: 'Function to handle image uploads',
      type: '(file: Blob) => Promise<string>',
      default: '–'
    }
  ];

  events = [
    {
      name: 'sent',
      description: 'Emitted when the send button is clicked and content is valid',
      type: 'EventEmitter<string>'
    },
    {
      name: 'canceled',
      description: 'Emitted when the cancel button is clicked',
      type: 'EventEmitter<void>'
    }
  ];
}
