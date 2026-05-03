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
      name: 'data<sup>*</sup>',
      description: 'The data to be displayed in the pie chart',
      type: 'number[]',
      default: '[]'
    },
    {
      name: 'labels',
      description: 'Labels for the data items',
      type: 'string[] | number[]',
      default: '[]'
    },
    {
      name: 'valueAccessor',
      description: 'Accessor function to get the value from a data item',
      type: '(d: any) => d',
      default: '(d: any) => d'
    },
    {
      name: 'dataItemStrokeWidth',
      description: 'Stroke width of the pie slices',
      type: 'number',
      default: '1'
    },
    {
      name: 'legendContainerWidth',
      description: 'Width of the legend container',
      type: 'number',
      default: '0'
    },
    {
      name: 'showDataAnimation',
      description: 'Whether to show animation when data changes',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'showValueOnSlices',
      description: 'Whether to show values on the pie slices',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'showLegend',
      description: 'Whether to show the legend',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'legendOffset',
      description: 'Offset of the legend from the chart',
      type: 'number',
      default: '30'
    },
    {
      name: 'legendItemHeight',
      description: 'Height of each legend item',
      type: 'number',
      default: '30'
    },
    {
      name: 'legendItemSymbolSize',
      description: 'Size of the symbol in the legend item',
      type: 'number',
      default: '12'
    },
    {
      name: 'legendItemFontSize',
      description: 'Font size of the legend item text',
      type: 'number',
      default: '14'
    },
    {
      name: 'legendItemSymbolBorderRadius',
      description: 'Border radius of the legend item symbol',
      type: 'number',
      default: '12'
    },
    {
      name: 'valueFontSize',
      description: 'Font size of the value text on slices',
      type: 'number',
      default: '12'
    },
    {
      name: 'tooltip',
      description: 'Custom tooltip template',
      type: 'TemplateRef<unknown>',
      default: '–'
    },
    {
      name: 'tooltipPosition',
      description: 'Position of the tooltip',
      type: 'OverlayPosition',
      default: "'after-center'"
    }
  ];
}
