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
})
export class Api {
  properties = [
    {
      name: 'ngsButton',
      description: 'The variant of the button',
      type: 'ButtonVariant',
      default: "'text'"
    },
    {
      name: 'ngsIconButton',
      description: 'Whether the button is an icon button',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'loading',
      description: 'Whether the button is in a loading state',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabled',
      description: 'Whether the button is disabled',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disabledInteractive',
      description: 'Whether the button remains focusable when disabled (e.g. for tooltips)',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'disableRipple',
      description: 'Whether the ripple effect is disabled',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'reverse',
      description: 'Whether to reverse the order of icon and text',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'fullWidth',
      description: 'Whether the button should take up the full width of its container',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'hideTextOnMobile',
      description: 'Whether to hide the button text on mobile devices',
      type: 'boolean',
      default: 'false'
    }
  ];
}
