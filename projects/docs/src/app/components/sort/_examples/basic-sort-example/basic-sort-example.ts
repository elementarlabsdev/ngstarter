import { AfterViewInit, Component, inject, PLATFORM_ID, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Sort, SortDirective, SortModule } from '@ngstarter-ui/components/sort';
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
  Table,
  TableDataSource
} from '@ngstarter-ui/components/table';

type Invoice = {
  invoice: string;
  customer: string;
  total: number;
  status: string;
};

const INVOICES: Invoice[] = [
  { invoice: 'INV-1007', customer: 'Acme Co.', total: 1250, status: 'Paid' },
  { invoice: 'INV-1008', customer: 'Northwind', total: 840, status: 'Pending' },
  { invoice: 'INV-1009', customer: 'Globex', total: 2320, status: 'Paid' },
  { invoice: 'INV-1010', customer: 'Stark Industries', total: 1640, status: 'Overdue' },
  { invoice: 'INV-1011', customer: 'Wayne Enterprises', total: 980, status: 'Pending' },
];

@Component({
  selector: 'app-basic-sort-example',
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
  templateUrl: './basic-sort-example.html',
  styleUrl: './basic-sort-example.scss'
})
export class BasicSortExample implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  readonly displayedColumns = ['invoice', 'customer', 'total', 'status'];
  readonly dataSource = new TableDataSource(INVOICES);
  readonly sort = viewChild.required(SortDirective);

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.dataSource.sort = this.sort();
    }
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this.liveAnnouncer.announce('Sorting cleared');
    }
  }
}
