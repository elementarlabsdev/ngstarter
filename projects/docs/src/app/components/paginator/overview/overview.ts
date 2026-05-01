import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicPaginatorExample } from '../_examples/basic-paginator-example/basic-paginator-example';
import {
  ConfigurablePaginatorExample
} from '../_examples/configurable-paginator-example/configurable-paginator-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicPaginatorExample,
    ConfigurablePaginatorExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
