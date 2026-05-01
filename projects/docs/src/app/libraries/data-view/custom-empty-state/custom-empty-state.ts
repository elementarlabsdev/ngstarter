import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewCustomEmptyStateExample } from '../_examples/data-view-custom-empty-state-example/data-view-custom-empty-state-example';

@Component({
  selector: 'app-custom-empty-state',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewCustomEmptyStateExample
  ],
  templateUrl: './custom-empty-state.html',
  styleUrl: './custom-empty-state.scss'
})
export class DataViewCustomEmptyState {
}
