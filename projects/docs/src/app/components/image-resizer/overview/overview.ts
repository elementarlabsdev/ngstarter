import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicImageResizerExample
} from '../_examples/basic-image-resizer-example/basic-image-resizer-example';

@Component({
  imports: [
    Playground,
    BasicImageResizerExample,
  ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './overview.scss'
})
export class Overview {

}
