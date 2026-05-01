import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicEmptyStateExample
} from '../_examples/basic-empty-state-example/basic-empty-state-example';
import {
  EmptyStateWithImageExample
} from '../_examples/empty-state-with-image-example/empty-state-with-image-example';
import {
  EmptyStateWithIconExample
} from '../_examples/empty-state-with-icon-example/empty-state-with-icon-example';
import {
  EmptyStateWithActionsExample
} from '../_examples/empty-state-with-actions-example/empty-state-with-actions-example';
import {
  EmptyStateWithCustomIconExample
} from '../_examples/empty-state-with-custom-icon-example/empty-state-with-custom-icon-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicEmptyStateExample,
    EmptyStateWithImageExample,
    EmptyStateWithIconExample,
    EmptyStateWithActionsExample,
    EmptyStateWithCustomIconExample,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
