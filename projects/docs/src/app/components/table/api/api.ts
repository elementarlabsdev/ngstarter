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
      name: 'hideHeader',
      description: 'Whether to hide the table header',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'hideBody',
      description: 'Whether to hide the table body',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'hideFooter',
      description: 'Whether to hide the table footer',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'dataSource',
      description: 'The data to be displayed in the table',
      type: 'T[] | DataSource<T> | Observable<T[]>',
      default: '–'
    },
    {
      name: 'trackBy',
      description: 'Tracking function that will be used to check the differences in data changes',
      type: 'TrackByFunction<T>',
      default: '–'
    },
    {
      name: 'fixedLayout',
      description: 'Whether the table should use a fixed layout',
      type: 'boolean',
      default: 'false'
    }
  ];
  columnProperties = [
    {
      name: 'ngsColumnDef',
      description: 'Unique name for this column.',
      type: 'string',
      default: '-'
    },
    {
      name: 'sticky',
      description: 'Whether the column is sticky',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'stickyEnd',
      description: 'Whether the column is sticky at the end',
      type: 'boolean',
      default: 'false'
    }
  ];
  rowProperties = [
    {
      name: 'ngsRowDefColumns',
      description: 'The columns to be displayed in this row',
      type: 'string[]',
      default: '-'
    }
  ];
}
