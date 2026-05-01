import { Component } from '@angular/core';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow, HeaderRowDef, NoDataRow,
  Row, RowDef,
  Table,
  TableDataSource
} from '@ngstarter-ui/components/table';
import { Input } from '@ngstarter-ui/components/input';

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
  selector: 'app-table-with-filtering-example',
  imports: [
    Input,
    Label,
    FormField,
    Table,
    ColumnDef,
    HeaderCell,
    CellDef,
    Cell,
    HeaderCellDef,
    HeaderRow,
    Row,
    HeaderRowDef,
    RowDef,
    NoDataRow
  ],
  templateUrl: './table-with-filtering-example.html',
  styleUrl: './table-with-filtering-example.scss'
})
export class TableWithFilteringExample {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new TableDataSource(ELEMENT_DATA);

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
