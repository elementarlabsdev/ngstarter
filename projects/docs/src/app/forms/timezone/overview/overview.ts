import { Component } from '@angular/core';
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
  styleUrl: './overview.scss'
})
export class Overview {

}
