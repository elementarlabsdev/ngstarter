import { Component } from '@angular/core';
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

@Component({
  imports: [
    Playground,
    BasicEmptyStateExample,
    EmptyStateWithImageExample,
    EmptyStateWithIconExample,
    EmptyStateWithActionsExample,
    EmptyStateWithCustomIconExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
