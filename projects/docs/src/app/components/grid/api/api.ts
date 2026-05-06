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
      name: 'configs',
      description: 'Configuration for grid items',
      type: 'GridItemConfig[]',
      default: '[]'
    },
    {
      name: 'items',
      description: 'Data items for the grid',
      type: 'GridItem[]',
      default: '[]'
    },
    {
      name: 'plain',
      description: 'Whether to use plain style',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'waitWhenAllItemsLoaded',
      description: 'Whether to wait until all items are loaded before displaying',
      type: 'boolean',
      default: 'false'
    }
  ];
  methods = [
    {
      name: 'markItemAsLoaded(id: any)',
      description: 'Marks an item as loaded'
    }
  ];
}
