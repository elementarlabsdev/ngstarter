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
      name: 'color',
      description: 'The color of the progress bar',
      type: 'string',
      default: 'primary'
    },
    {
      name: 'value',
      description: 'The progress value (0 to 100)',
      type: 'number',
      default: '0'
    },
    {
      name: 'bufferValue',
      description: 'The buffer progress value (0 to 100)',
      type: 'number',
      default: '0'
    },
    {
      name: 'mode',
      description: 'The mode of the progress bar',
      type: 'ProgressBarMode',
      default: 'determinate'
    }
  ];

  events = [
    {
      name: 'animationEnd',
      description: 'Emitted when the progress bar animation ends'
    }
  ];
}
