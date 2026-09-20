import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicActionRequiredExample
} from '../_examples/basic-action-required-example/basic-action-required-example';

@Component({
  imports: [
    Playground,
    BasicActionRequiredExample,
  ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './overview.scss'
})
export class Overview {

}
