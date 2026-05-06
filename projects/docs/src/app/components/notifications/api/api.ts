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
  notificationListProperties = [
    {
      name: 'notifications<sup>*</sup>',
      description: 'The list of notifications to display',
      type: 'T[]',
      default: '[]'
    },
    {
      name: 'static',
      description: 'Whether the list should have a static height/behavior',
      type: 'boolean',
      default: 'true'
    }
  ];

  notificationProperties = [
    {
      name: 'isUnread',
      description: 'Whether the notification is unread',
      type: 'boolean',
      default: 'false'
    }
  ];
}
