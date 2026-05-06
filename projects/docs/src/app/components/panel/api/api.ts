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
      name: 'absolute',
      description: 'Whether the panel should have absolute positioning',
      type: 'boolean',
      default: 'false'
    }
  ];

  sections = [
    {
      name: 'ngs-panel-header',
      description: 'Header section of the panel'
    },
    {
      name: 'ngs-panel-subheader',
      description: 'Subheader section of the panel'
    },
    {
      name: 'ngs-panel-sidebar',
      description: 'Sidebar section of the panel'
    },
    {
      name: 'ngs-panel-content',
      description: 'Main content section of the panel'
    },
    {
      name: 'ngs-panel-aside',
      description: 'Aside section of the panel'
    },
    {
      name: 'ngs-panel-footer',
      description: 'Footer section of the panel'
    }
  ];
}
