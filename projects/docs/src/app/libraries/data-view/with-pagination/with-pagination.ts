import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewWithPaginationExample } from '../_examples/data-view-with-pagination-example/data-view-with-pagination-example';

@Component({
  selector: 'app-with-pagination',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewWithPaginationExample
  ],
  templateUrl: './with-pagination.html',
  styleUrl: './with-pagination.scss'
})
export class DataViewWithPagination {
}
