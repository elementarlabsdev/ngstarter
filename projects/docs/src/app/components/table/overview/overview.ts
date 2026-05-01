import { Component } from '@angular/core';
import { BasicTableExample } from '../_examples/basic-table-example/basic-table-example';
import { Playground } from '@meta/playground/playground';
import {
  TableWithPaginationExample
} from '../_examples/table-with-pagination-example/table-with-pagination-example';
import { TableWithSortExample } from '../_examples/table-with-sort-example/table-with-sort-example';
import {
  TableWithFilteringExample
} from '../_examples/table-with-filtering-example/table-with-filtering-example';
import {
  TableWithSelectionExample
} from '../_examples/table-with-selection-example/table-with-selection-example';
import {
  TableWithFixedColumnsExample
} from '../_examples/table-with-fixed-columns-example/table-with-fixed-columns-example';
import {
  TableWithStickyHeaderExample
} from '../_examples/table-with-sticky-header-example/table-with-sticky-header-example';
import {
  TableWithStickyFooterExample
} from '../_examples/table-with-sticky-footer-example/table-with-sticky-footer-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { SortableTableExample } from '../_examples/sortable-table-example/sortable-table-example';
import { StaticTableExample } from '../_examples/static-table-example/static-table-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicTableExample,
    TableWithPaginationExample,
    TableWithSortExample,
    TableWithFilteringExample,
    TableWithSelectionExample,
    TableWithFixedColumnsExample,
    TableWithStickyHeaderExample,
    TableWithStickyFooterExample,
    Page,
    PageContentDirective,
    SortableTableExample,
    StaticTableExample,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
