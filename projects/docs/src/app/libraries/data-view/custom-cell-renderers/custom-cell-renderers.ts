import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewCustomCellRenderersExample } from '../_examples/data-view-custom-cell-renderers-example/data-view-custom-cell-renderers-example';

@Component({
  selector: 'app-custom-cell-renderers',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewCustomCellRenderersExample
  ],
  templateUrl: './custom-cell-renderers.html',
  styleUrl: './custom-cell-renderers.scss'
})
export class DataViewCustomCellRenderers {
}
