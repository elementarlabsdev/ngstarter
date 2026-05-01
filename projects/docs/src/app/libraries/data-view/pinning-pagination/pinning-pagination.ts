import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewPinningPaginationExample } from '../_examples/data-view-pinning-pagination-example/data-view-pinning-pagination-example';

@Component({
  selector: 'app-pinning-pagination',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewPinningPaginationExample
  ],
  templateUrl: './pinning-pagination.html',
  styleUrl: './pinning-pagination.scss'
})
export class DataViewPinningPagination {
}
