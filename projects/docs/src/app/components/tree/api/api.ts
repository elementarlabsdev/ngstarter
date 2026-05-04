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
      name: 'dataSource',
      description: 'The data source that contains the data to be rendered.',
      type: 'DataSource<T> | Observable<T[]> | T[]',
      default: '–'
    },
    {
      name: 'treeControl',
      description: 'The tree control that handles the tree\'s expansion state.',
      type: 'TreeControl<T, K>',
      default: '–'
    },
    {
      name: 'trackBy',
      description: 'Tracking function that will be used to check the differences in data changes.',
      type: 'TrackByFunction<T>',
      default: '–'
    }
  ];

  nodeProperties = [
    {
      name: 'disabled',
      description: 'Whether the tree node is disabled.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'tabIndex',
      description: 'Tabindex of the tree node.',
      type: 'number',
      default: '0'
    }
  ];

  events = [
    {
      name: 'activation',
      description: 'Event emitted when the node is activated.'
    },
    {
      name: 'expandedChange',
      description: 'Event emitted when the node expansion state changes.'
    }
  ];
}
