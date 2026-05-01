import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewWithActionBarExample } from '../_examples/data-view-with-action-bar-example/data-view-with-action-bar-example';

@Component({
  selector: 'app-with-action-bar',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewWithActionBarExample
  ],
  templateUrl: './with-action-bar.html',
  styleUrl: './with-action-bar.scss'
})
export class DataViewWithActionBar {
}
