import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import {
  DataViewRowClickSelectionExample
} from '../_examples/data-view-row-click-selection-example/data-view-row-click-selection-example';

@Component({
  selector: 'app-row-click-selection',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewRowClickSelectionExample
  ],
  templateUrl: './row-click-selection.html',
  styleUrl: './row-click-selection.scss'
})
export class DataViewRowClickSelection {
}
