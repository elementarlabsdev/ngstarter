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
      name: 'src<sup>*</sup>',
      description: 'The source URL of the image to be processed',
      type: 'string',
      default: '–'
    },
    {
      name: 'helperText',
      description: 'Instructional text displayed to the user',
      type: 'string',
      default: "''"
    }
  ];

  methods = [
    {
      name: 'getDataUrl()',
      description: 'Returns the resulting thumbnail as a Data URL',
      type: 'string'
    },
    {
      name: 'toBlob(callback: BlobCallback)',
      description: 'Converts the thumbnail to a Blob and passes it to the callback',
      type: 'void'
    },
    {
      name: 'getCanvas()',
      description: 'Returns the canvas element containing the thumbnail',
      type: 'HTMLCanvasElement'
    },
    {
      name: 'increase()',
      description: 'Increases the zoom level',
      type: 'void'
    },
    {
      name: 'decrease()',
      description: 'Decreases the zoom level',
      type: 'void'
    }
  ];
}
