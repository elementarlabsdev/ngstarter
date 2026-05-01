import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewLoadingStateExample } from '../_examples/data-view-loading-state-example/data-view-loading-state-example';

@Component({
  selector: 'app-loading-state',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewLoadingStateExample
  ],
  templateUrl: './loading-state.html',
  styleUrl: './loading-state.scss'
})
export class DataViewLoadingState {
}
