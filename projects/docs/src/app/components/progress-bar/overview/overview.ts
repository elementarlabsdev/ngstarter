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

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    BasicProgressBarExample,
    IntermediateProgressBarExample,
    BufferProgressBarExample,
    QueryProgressBarExample,
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
