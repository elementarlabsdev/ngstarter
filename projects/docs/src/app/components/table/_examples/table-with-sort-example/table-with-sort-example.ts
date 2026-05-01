import { AfterViewInit, Component, inject, PLATFORM_ID, viewChild } from '@angular/core';

import { SortDirective, SortModule, Sort } from '@ngstarter/components/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { isPlatformBrowser } from '@angular/common';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow, HeaderRowDef,
  Row, RowDef,
  Table,
  TableDataSource
} from '@ngstarter/components/table';

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
  selector: 'app-table-with-sort-example',
  imports: [

    SortModule,
    Table,
    ColumnDef,
    HeaderCell,
    HeaderCellDef,
    Cell,
    CellDef,
    HeaderRow,
    Row,
    HeaderRowDef,
    RowDef
  ],
  templateUrl: './table-with-sort-example.html',
  styleUrl: './table-with-sort-example.scss'
})
export class TableWithSortExample implements AfterViewInit {
  private _platformId = inject(PLATFORM_ID);
  private _liveAnnouncer = inject(LiveAnnouncer);

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new TableDataSource(ELEMENT_DATA);
  readonly sort = viewChild.required(SortDirective);

  ngAfterViewInit() {
    if (isPlatformBrowser(this._platformId)) {
      this.dataSource.sort = this.sort();
    }
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
