import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicTimezoneSelectExample
} from '../_examples/basic-timezone-select-example/basic-timezone-select-example';

@Component({
  imports: [
    Playground,
    BasicTimezoneSelectExample
  ],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './overview.scss'
})
export class Overview {

}
