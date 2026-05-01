import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewServerSideExample } from '../_examples/data-view-server-side-example/data-view-server-side-example';

@Component({
  selector: 'app-server-side',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewServerSideExample
  ],
  templateUrl: './server-side.html',
  styleUrl: './server-side.scss'
})
export class DataViewServerSide {
}
