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
  styleUrl: './api.scss',
})
export class Api {
  properties = [
    {
      name: 'initialPosition',
      description: 'The initial position of the slider handle in percentage (0-100).',
      type: 'InputSignal<number>',
      default: '50'
    }
  ];

  directives = [
    {
      name: 'ngsComparisonSliderBeforeImage',
      description: 'Directive to identify the "before" image in the slider.'
    },
    {
      name: 'ngsComparisonSliderAfterImage',
      description: 'Directive to identify the "after" image in the slider.'
    }
  ];
}
