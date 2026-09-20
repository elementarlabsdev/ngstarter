import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicResizableContainerExample
} from '../_examples/basic-resizable-container-example/basic-resizable-container-example';

@Component({
  imports: [
    Playground,
    BasicResizableContainerExample
  ],
    templateUrl: './overview.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './overview.scss'
})
export class Overview {

}
