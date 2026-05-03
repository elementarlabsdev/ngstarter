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
      name: 'title',
      description: 'Title of an announcement',
      type: 'string',
      default: '–'
    },
    {
      name: 'variant',
      description: 'Colored variant of an announcement',
      type: 'AnnouncementVariant | string',
      default: 'neutral'
    },
    {
      name: 'iconName',
      description: 'Name of an icon',
      type: 'string',
      default: '–'
    },
    {
      name: 'closable',
      description: 'Whether the announcement can be closed',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'linkTo',
      description: 'Object with link text and URL',
      type: 'AnnouncementLinkTo',
      default: 'null'
    }
  ];

  events = [
    {
      name: 'closed',
      description: 'Executed when the close button is clicked'
    }
  ];
}
