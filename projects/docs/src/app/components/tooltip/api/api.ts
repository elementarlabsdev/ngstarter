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
      name: 'ngsTooltip',
      description: 'The message to be displayed in the tooltip',
      type: 'string',
      default: '–'
    },
    {
      name: 'ngsTooltipPosition',
      description: 'The position of the tooltip',
      type: "'above' | 'below' | 'left' | 'right' | 'before' | 'after'",
      default: 'below'
    },
    {
      name: 'ngsTooltipClass',
      description: 'Custom CSS classes to be applied to the tooltip',
      type: 'any',
      default: '–'
    },
    {
      name: 'ngsTooltipShowDelay',
      description: 'The delay before the tooltip is shown (in ms)',
      type: 'number',
      default: '0'
    },
    {
      name: 'ngsTooltipHideDelay',
      description: 'The delay before the tooltip is hidden (in ms)',
      type: 'number',
      default: '0'
    },
    {
      name: 'ngsTooltipOffset',
      description: 'The offset of the tooltip from the element (in px)',
      type: 'number',
      default: '6'
    },
    {
      name: 'ngsTooltipPositionAtOrigin',
      description: 'Whether the tooltip should be positioned at the mouse/touch origin',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'ngsTooltipDisabled',
      description: 'Whether the tooltip is disabled',
      type: 'boolean',
      default: 'false'
    }
  ];
}
