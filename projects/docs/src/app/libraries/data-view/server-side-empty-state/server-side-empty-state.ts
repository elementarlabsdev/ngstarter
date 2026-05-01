import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewServerSideEmptyStateExample } from '../_examples/data-view-server-side-empty-state-example/data-view-server-side-empty-state-example';

@Component({
  selector: 'app-server-side-empty-state',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewServerSideEmptyStateExample
  ],
  templateUrl: './server-side-empty-state.html',
  styleUrl: './server-side-empty-state.scss'
})
export class DataViewServerSideEmptyState {
}
