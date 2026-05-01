import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewColumnPinningExample } from '../_examples/data-view-column-pinning-example/data-view-column-pinning-example';

@Component({
  selector: 'app-column-pinning',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewColumnPinningExample
  ],
  templateUrl: './column-pinning.html',
  styleUrl: './column-pinning.scss'
})
export class DataViewColumnPinning {
}
