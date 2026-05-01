import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicFilterBuilderExample
} from '../_examples/basic-filter-builder-example/basic-filter-builder-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicFilterBuilderExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
