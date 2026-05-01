import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataviewWithSelectionExample } from '../_examples/dataview-with-selection-example/dataview-with-selection-example';

@Component({
  selector: 'app-with-selection',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataviewWithSelectionExample
  ],
  templateUrl: './with-selection.html',
  styleUrl: './with-selection.scss'
})
export class DataviewWithSelection {
}
