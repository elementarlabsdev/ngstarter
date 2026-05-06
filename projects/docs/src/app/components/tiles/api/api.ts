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
  tilesProperties = [
    {
      name: 'items',
      description: 'The data array used to render tiles. Required for reordering logic to work correctly.',
      type: 'any[]',
      default: '[]'
    },
    {
      name: 'columns',
      description: 'Total number of columns in the grid.',
      type: 'number',
      default: '12'
    },
    {
      name: 'gap',
      description: 'Gap between tiles.',
      type: 'number | string',
      default: '24'
    }
  ];

  tilesEvents = [
    {
      name: 'orderChange',
      description: 'Emitted when the visual order of tiles changes during dragging.'
    },
    {
      name: 'orderChanged',
      description: 'Emitted when the dragging finishes and the new order is finalized.'
    },
    {
      name: 'layoutChanged',
      description: 'Emitted when the layout is recalculated.'
    }
  ];

  tileProperties = [
    {
      name: 'width<sup>*</sup>',
      description: 'Number of columns the tile should span.',
      type: 'number',
      default: '-'
    },
    {
      name: 'height<sup>*</sup>',
      description: 'Number of rows the tile should span.',
      type: 'number',
      default: '-'
    },
    {
      name: 'width.sm',
      description: 'Column span for sm breakpoint.',
      type: 'number',
      default: 'undefined'
    },
    {
      name: 'width.md',
      description: 'Column span for md breakpoint.',
      type: 'number',
      default: 'undefined'
    },
    {
      name: 'width.lg',
      description: 'Column span for lg breakpoint.',
      type: 'number',
      default: 'undefined'
    },
    {
      name: 'width.xl',
      description: 'Column span for xl breakpoint.',
      type: 'number',
      default: 'undefined'
    },
    {
      name: 'height.sm',
      description: 'Row span for sm breakpoint.',
      type: 'number',
      default: 'undefined'
    },
    {
      name: 'height.md',
      description: 'Row span for md breakpoint.',
      type: 'number',
      default: 'undefined'
    },
    {
      name: 'height.lg',
      description: 'Row span for lg breakpoint.',
      type: 'number',
      default: 'undefined'
    },
    {
      name: 'height.xl',
      description: 'Row span for xl breakpoint.',
      type: 'number',
      default: 'undefined'
    }
  ];
}
