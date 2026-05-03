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
  standalone: true,
  imports: [
    Table,
    ColumnDef,
    HeaderCell,
    Cell,
    HeaderRow,
    Row,
    HeaderRowDef,
    RowDef,
    HeaderCellDef,
    CellDef
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss'
})
export class ApiComponent {
  componentProperties = [
    {
      name: '<code>withTranslate</code>',
      description: 'Whether the overlay should have a translate effect.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: '<code>withBlur</code>',
      description: 'Whether the overlay should have a blur effect.',
      type: 'boolean',
      default: 'false'
    },
    {
      name: '<code>disabled</code>',
      description: 'Whether the overlay is disabled.',
      type: 'boolean',
      default: 'false'
    }
  ];

  directiveProperties = [
    {
      name: '<code>ngsCardOverlayContainer</code>',
      description: 'Selector for the card overlay container directive. Sets position relative and overflow hidden.',
      type: 'directive'
    }
  ];
}
