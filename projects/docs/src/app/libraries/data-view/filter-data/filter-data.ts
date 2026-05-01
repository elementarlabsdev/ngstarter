import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewFilterDataExample } from '../_examples/data-view-filter-data-example/data-view-filter-data-example';

@Component({
  selector: 'app-filter-data',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewFilterDataExample
  ],
  templateUrl: './filter-data.html',
  styleUrl: './filter-data.scss'
})
export class DataViewFilterData {
}
