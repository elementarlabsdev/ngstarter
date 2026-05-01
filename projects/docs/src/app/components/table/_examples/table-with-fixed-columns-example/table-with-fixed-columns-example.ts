import { Component } from '@angular/core';

import { Icon } from '@ngstarter/components/icon';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow, HeaderRowDef,
  Row, RowDef,
  Table
} from '@ngstarter/components/table';
import { Button } from '@ngstarter/components/button';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
  selector: 'app-table-with-fixed-columns-example',
  imports: [
    Icon,
    Table,
    ColumnDef,
    HeaderCell,
    Cell,
    HeaderCellDef,
    CellDef,
    Button,
    HeaderRow,
    Row,
    HeaderRowDef,
    RowDef
  ],
  templateUrl: './table-with-fixed-columns-example.html',
  styleUrl: './table-with-fixed-columns-example.scss'
})
export class TableWithFixedColumnsExample {
  displayedColumns = [
    'name',
    'position',
    'weight',
    'symbol',
    'position',
    'weight',
    'symbol',
    'star',
  ];
  dataSource = ELEMENT_DATA;
}
