import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicProgressBarExample
} from '../_examples/basic-progress-bar-example/basic-progress-bar-example';
import {
  IntermediateProgressBarExample
} from '../_examples/intermediate-progress-bar-example/intermediate-progress-bar-example';
import {
  BufferProgressBarExample
} from '../_examples/buffer-progress-bar-example/buffer-progress-bar-example';
import {
  QueryProgressBarExample
} from '../_examples/query-progress-bar-example/query-progress-bar-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicProgressBarExample,
    IntermediateProgressBarExample,
    BufferProgressBarExample,
    QueryProgressBarExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
