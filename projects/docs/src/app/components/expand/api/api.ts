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
      name: 'expanded',
      description: 'Show/Hide block content',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'color',
      description: 'Color of a fade',
      type: 'string',
      default: "''"
    },
    {
      name: 'expandLabel',
      description: 'Label of the expand button if block collapsed',
      type: 'string',
      default: 'Show more'
    },
    {
      name: 'collapseLabel',
      description: 'Label of the expand button if block expanded',
      type: 'string',
      default: 'Show less'
    },
    {
      name: 'showButtonIfExpanded',
      description: 'Show button by hover if block is expanded',
      type: 'boolean',
      default: 'false'
    },
    {
      name: 'height',
      description: 'Height of a block',
      type: 'string',
      default: "''"
    }
  ];

  events = [
    {
      name: 'expandedChange',
      type: 'boolean',
      description: 'Executed when an expand button clicked'
    }
  ];
}
