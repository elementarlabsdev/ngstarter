import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicListExample } from '../_examples/basic-list-example/basic-list-example';
import {
  ListWithSectionsExample
} from '../_examples/list-with-sections-example/list-with-sections-example';
import {
  ListWithSelectionExample
} from '../_examples/list-with-selection-example/list-with-selection-example';
import {
  ListWithSingleSelectionExample
} from '../_examples/list-with-single-selection-example/list-with-single-selection-example';
import { ListVariantsExample } from '../_examples/list-variants-example/list-variants-example';
import { NavListExample } from '../_examples/nav-list-example/nav-list-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicListExample,
    ListWithSectionsExample,
    ListWithSelectionExample,
    ListWithSingleSelectionExample,
    ListVariantsExample,
    NavListExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
