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
  selector: 'app-line-chart-api',
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
      name: 'data',
      description: 'Array of numbers to be displayed in the chart',
      type: 'number[]',
      default: '[]'
    },
    {
      name: 'labels',
      description: 'Array of labels corresponding to data points',
      type: 'any[]',
      default: '[]'
    },
    {
      name: 'strokeWidth',
      description: 'Width of the line',
      type: 'number',
      default: '2'
    },
    {
      name: 'showArea',
      description: 'Whether to show the filled area under the line',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'showMarkers',
      description: 'Whether to show markers on data points',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'responsive',
      description: 'Whether the chart should be responsive to container size',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'fillAreaGradient',
      description: 'Whether to use a gradient for the filled area',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'curve',
      description: 'Type of curve for the line (linear, catmullRom, curveBumpX, curveStep)',
      type: 'MchartLineCurveType',
      default: "'linear'"
    },
    {
      name: 'compact',
      description: 'Whether to use compact mode (starts y-axis from minimum value)',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'markerDotSize',
      description: 'Size of the markers',
      type: 'number',
      default: '5'
    },
    {
      name: 'tooltip',
      description: 'Template for the custom tooltip',
      type: 'TemplateRef<unknown>',
      default: 'undefined'
    },
    {
      name: 'tooltipPosition',
      description: 'Position of the tooltip',
      type: 'OverlayPosition',
      default: "'after-center'"
    }
  ];
}
