import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicTreeExample } from '../_examples/basic-tree-example/basic-tree-example';
import {
  TreeWithDynamicDataExample
} from '../_examples/tree-with-dynamic-data-example/tree-with-dynamic-data-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicTreeExample,
    TreeWithDynamicDataExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
