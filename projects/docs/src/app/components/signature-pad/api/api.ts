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
      name: 'penColor',
      description: 'The color of the pen stroke. Can be any valid CSS color string.',
      type: 'model&lt;string&gt;',
      default: '#000'
    },
    {
      name: 'lineWidth',
      description: 'The thickness of the pen stroke.',
      type: 'number',
      default: '4'
    },
    {
      name: 'backgroundColor',
      description: 'The background color of the signature pad.',
      type: 'string',
      default: 'transparent'
    },
    {
      name: 'lazyRadius',
      description: 'The radius for the lazy brush effect. Higher values mean more smoothing.',
      type: 'number',
      default: '3'
    },
    {
      name: 'lazyFriction',
      description: 'The friction for the lazy brush effect.',
      type: 'number',
      default: '0.1'
    },
    {
      name: 'lazyEnabled',
      description: 'Whether to enable the lazy brush effect.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'colors',
      description: 'The available colors in the color switcher.',
      type: 'string[]',
      default: "['#000', '#0059ff', '#ff0000']"
    }
  ];
  events = [
    {
      name: 'signatureSaved',
      description: 'Emitted when a signature is saved. Returns the signature as a base64-encoded PNG data URL.',
      type: 'string'
    },
    {
      name: 'signatureCleared',
      description: 'Emitted when the signature pad is cleared.',
      type: 'void'
    }
  ];
}
