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
      name: 'content',
      description: 'Initial HTML content rendered inside the editor',
      type: 'string',
      default: "''"
    },
    {
      name: 'extensions',
      description: 'Additional Tiptap extensions to register before the built-in editor extensions',
      type: 'any[]',
      default: '[]'
    },
    {
      name: 'contentMaxHeight',
      description: 'Maximum height of the content area',
      type: 'number',
      default: '–'
    },
    {
      name: 'placeholder',
      description: 'Placeholder text',
      type: 'string',
      default: 'Write something …'
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
      name: 'contentChange',
      description: 'Emitted with the current HTML content whenever the editor updates',
      type: 'OutputEmitterRef<string>'
    }
  ];

  api = [
    {
      name: 'api.isCommandDisabled(command, options?)',
      description: 'Returns whether a command cannot run in the current editor state',
      type: 'boolean | null'
    },
    {
      name: 'api.isActive(command, options?)',
      description: 'Returns whether a mark, node, or command state is active',
      type: 'boolean'
    },
    {
      name: 'api.runCommand(command, options?)',
      description: 'Runs a Tiptap chain command with focus',
      type: 'void'
    },
    {
      name: 'api.editor()',
      description: 'Returns the underlying Tiptap editor instance',
      type: 'Editor'
    }
  ];
}
