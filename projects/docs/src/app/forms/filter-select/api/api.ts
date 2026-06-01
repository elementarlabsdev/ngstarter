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
  selector: 'app-filter-select-api',
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
  readonly properties = [
    {
      name: 'maxCount',
      description: 'Maximum selected count before the multiple-selection badge renders the value with a plus suffix.',
      type: 'number',
      default: '99'
    },
    {
      name: 'showZero',
      description: 'Whether to render the multiple-selection badge when the parent Select has no selected values.',
      type: 'boolean',
      default: 'false'
    }
  ];

  readonly templateContext = [
    {
      name: '$implicit / data',
      description: 'Selected option data. For multiple Select controls this is an array; for single Select controls this is one value.',
      type: 'unknown | unknown[]'
    },
    {
      name: 'text',
      description: 'Selected option display text from the parent Select, available as let-text="text" in the custom value template.',
      type: 'string'
    },
    {
      name: 'count',
      description: 'Number of selected options.',
      type: 'number'
    },
    {
      name: 'multiple',
      description: 'Whether the parent Select is in multiple selection mode.',
      type: 'boolean'
    }
  ];
}
