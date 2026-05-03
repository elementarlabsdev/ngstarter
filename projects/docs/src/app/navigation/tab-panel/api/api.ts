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
      name: 'hideContentIfTabNotSelected',
      description: 'Whether to hide the content of the tab if it is not selected',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'activeItemId',
      description: 'The id of the active tab item',
      type: 'any',
      default: '–'
    },
    {
      name: 'compact',
      description: 'Whether the tab panel is in compact mode',
      type: 'boolean',
      default: 'false'
    }
  ];
  events = [
    {
      name: 'itemIdChanged',
      description: 'Executed when the active item id changes'
    }
  ];
}
