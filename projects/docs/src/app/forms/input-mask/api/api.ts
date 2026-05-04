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
  creditCardNumberProperties = [
    {
      name: 'placeholder',
      description: 'The placeholder text for the input field',
      type: 'string',
      default: '0000 0000 0000 0000'
    }
  ];

  creditCardExpiryProperties = [
    {
      name: 'placeholder',
      description: 'The placeholder text for the input field',
      type: 'string',
      default: 'MM/YY'
    }
  ];

  creditCardCvvProperties = [
    {
      name: 'placeholder',
      description: 'The placeholder text for the input field',
      type: 'string',
      default: '•••'
    }
  ];
}
