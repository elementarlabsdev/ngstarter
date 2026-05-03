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
  styleUrl: './api.scss'
})
export class Api {
  properties = [
    {
      name: 'data<sup>*</sup>',
      description: 'Array of numeric values to be displayed in the chart.',
      type: 'number[]',
      default: '[]'
    },
    {
      name: 'labels',
      description: 'Array of strings to be used as labels for the data points.',
      type: 'string[]',
      default: '[]'
    },
    {
      name: 'gap',
      description: 'The gap between bars.',
      type: 'number',
      default: '0.2'
    },
    {
      name: 'radius',
      description: 'The corner radius of the bars.',
      type: 'number',
      default: '0'
    },
    {
      name: 'highlight',
      description: 'Whether to highlight bars on hover.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'responsive',
      description: 'Whether the chart should resize automatically to fit its container.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'fillGradient',
      description: 'Whether to use a gradient fill for the bars.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'xAccessor',
      description: 'Function to access the x-value (index by default).',
      type: '(d: any, i: number) => any',
      default: '–'
    },
    {
      name: 'yAccessor',
      description: 'Function to access the y-value (value by default).',
      type: '(d: any) => any',
      default: '–'
    },
    {
      name: 'tooltip',
      description: 'Optional template for the tooltip.',
      type: 'TemplateRef<any>',
      default: '–'
    },
    {
      name: 'tooltipPosition',
      description: 'Position of the tooltip.',
      type: 'OverlayPosition',
      default: "'after-center'"
    }
  ];
}
