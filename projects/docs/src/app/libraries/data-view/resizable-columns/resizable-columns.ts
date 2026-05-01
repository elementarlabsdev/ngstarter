import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewResizableColumnsExample } from '../_examples/data-view-resizable-columns-example/data-view-resizable-columns-example';

@Component({
  selector: 'app-resizable-columns',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewResizableColumnsExample
  ],
  templateUrl: './resizable-columns.html',
  styleUrl: './resizable-columns.scss'
})
export class DataViewResizableColumns {
}
