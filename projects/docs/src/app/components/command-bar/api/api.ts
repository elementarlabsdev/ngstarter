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
import { Divider } from '@ngstarter-ui/components/divider';

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
    Row,
    Divider
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss',
})
export class Api {
  commandBarProperties = [
    {
      name: 'open',
      description: 'Whether to open (show) command bar.',
      type: 'boolean',
      default: '–'
    },
    {
      name: 'position',
      description: '',
      type: 'CommandBarPosition: top | bottom',
      default: 'bottom'
    }
  ];

  commandProperties = [
    {
      name: 'shortcut',
      description: 'The command\'s shortcut.',
      type: 'string',
      default: '–'
    }
  ];
}
