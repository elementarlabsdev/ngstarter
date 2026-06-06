import { Component, signal } from '@angular/core';
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
  properties = signal([
    {
      name: 'fileName',
      description: 'File name used to resolve the icon from its extension.',
      type: 'string | null | undefined',
      default: 'undefined'
    },
    {
      name: 'extension',
      description: 'Explicit extension. Takes priority over fileName and mimeType.',
      type: 'string | null | undefined',
      default: 'undefined'
    },
    {
      name: 'mimeType',
      description: 'MIME type used when no extension can be resolved.',
      type: 'string | null | undefined',
      default: 'undefined'
    },
    {
      name: 'fallback',
      description: 'Icon type used when the extension and MIME type are unknown.',
      type: 'FileTypeName',
      default: 'txt'
    },
    {
      name: 'label',
      description: 'Accessible label for the icon host.',
      type: 'string | null | undefined',
      default: '`${type.toUpperCase()} file`'
    },
    {
      name: 'decorative',
      description: 'Marks the icon as decorative and removes role and label from the host.',
      type: 'boolean',
      default: 'false'
    }
  ]);

  types = signal([
    {
      name: 'FileTypeName',
      description: 'Supported icon names.',
      type: "'avi' | 'csv' | 'doc' | 'html' | 'jpg' | 'json' | 'mkv' | 'mov' | 'mp3' | 'mp4' | 'pdf' | 'png' | 'ppt' | 'svg' | 'txt' | 'wav' | 'webm' | 'xls' | 'xml' | 'zip'",
      default: ''
    }
  ]);
}
