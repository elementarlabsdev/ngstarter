import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  Cell,
  CellDef,
  ColumnDef,
  FooterCell,
  FooterCellDef, FooterRow, FooterRowDef,
  HeaderCell,
  HeaderCellDef, HeaderRow, HeaderRowDef, Row, RowDef,
  Table
} from '@ngstarter/components/table';

export interface Transaction {
  item: string;
  cost: number;
}

@Component({
    selector: 'app-table-with-sticky-footer-example',
  imports: [

    CurrencyPipe,
    Table,
    ColumnDef,
    HeaderCell,
    Cell,
    FooterCell,
    HeaderCellDef,
    CellDef,
    FooterCellDef,
    HeaderRow,
    Row,
    FooterRow,
    HeaderRowDef,
    RowDef,
    FooterRowDef
  ],
    templateUrl: './table-with-sticky-footer-example.html',
    styleUrl: './table-with-sticky-footer-example.scss'
})
export class TableWithStickyFooterExample {
  displayedColumns = ['item', 'cost'];
  transactions: Transaction[] = [
    { item: 'Beach ball', cost: 4 },
    { item: 'Towel', cost: 5 },
    { item: 'Frisbee', cost: 2 },
    { item: 'Sunscreen', cost: 4 },
    { item: 'Cooler', cost: 25 },
    { item: 'Swim suit', cost: 15 },
  ];

  /** Gets the total cost of all transactions. */
  getTotalCost() {
    return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  }
}
