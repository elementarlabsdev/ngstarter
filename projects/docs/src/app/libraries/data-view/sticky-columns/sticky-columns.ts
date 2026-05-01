import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewStickyColumnsExample } from '../_examples/data-view-sticky-columns-example/data-view-sticky-columns-example';

@Component({
  selector: 'app-sticky-columns',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewStickyColumnsExample
  ],
  templateUrl: './sticky-columns.html',
  styleUrl: './sticky-columns.scss'
})
export class DataViewStickyColumns {
}
