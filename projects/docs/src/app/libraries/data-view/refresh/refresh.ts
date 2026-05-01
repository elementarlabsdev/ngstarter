import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewRefreshExample } from '../_examples/data-view-refresh-example/data-view-refresh-example';

@Component({
  selector: 'app-refresh',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewRefreshExample
  ],
  templateUrl: './refresh.html',
  styleUrl: './refresh.scss'
})
export class DataViewRefresh {
}
