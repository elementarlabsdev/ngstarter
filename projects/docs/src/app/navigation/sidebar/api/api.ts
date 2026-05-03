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
      name: 'activeKey',
      description: 'The key of the currently active navigation item',
      type: 'any',
      default: 'undefined'
    },
    {
      name: 'dataSource',
      description: 'Data source for the navigation items',
      type: 'any[]',
      default: 'undefined'
    },
    {
      name: 'itemTypeProperty',
      description: 'Property name to determine item type',
      type: 'string',
      default: "'type'"
    },
    {
      name: 'autoScrollToActiveItem',
      description: 'Whether to automatically scroll to the active item on render',
      type: 'boolean',
      default: 'false'
    }
  ];
  events = [
    {
      name: 'itemClicked',
      description: 'Emitted when a navigation item is clicked'
    }
  ];
}
