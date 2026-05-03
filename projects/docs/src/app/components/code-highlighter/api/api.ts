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
})
export class Api {
  properties = [
    {
      name: 'code<sup>*</sup>',
      description: 'The source code to be highlighted.',
      type: 'string',
      default: '–'
    },
    {
      name: 'language',
      description: 'The language for syntax highlighting.',
      type: 'string',
      default: 'none'
    },
    {
      name: 'theme',
      description: 'The Shiki theme to use.',
      type: 'string',
      default: 'github-light'
    },
    {
      name: 'title',
      description: 'The title displayed above the code block.',
      type: 'string | null',
      default: 'null'
    },
    {
      name: 'appearance',
      description: 'The visual appearance of the code block.',
      type: "'none' | 'bordered'",
      default: 'bordered'
    },
    {
      name: 'diff',
      description: 'Whether to enable diff mode highlighting.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'highlightLines',
      description: 'Specific lines or ranges to highlight.',
      type: 'number[] | number[][]',
      default: '[]'
    },
    {
      name: 'showLanguage',
      description: 'Whether to display the language label.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'showCopyButton',
      description: 'Whether to show the copy to clipboard button.',
      type: 'boolean',
      default: 'false'
    }
  ];
}
