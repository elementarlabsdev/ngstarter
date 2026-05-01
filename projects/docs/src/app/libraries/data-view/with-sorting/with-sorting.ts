import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewWithSortingExample } from '../_examples/data-view-with-sorting-example/data-view-with-sorting-example';

@Component({
  selector: 'app-with-sorting',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewWithSortingExample
  ],
  templateUrl: './with-sorting.html',
  styleUrl: './with-sorting.scss'
})
export class DataViewWithSorting {
}
