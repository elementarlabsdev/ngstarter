import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicDateFormatSelectExample
} from '../_examples/basic-date-format-select-example/basic-date-format-select-example';

@Component({
  imports: [
    Playground,
    BasicDateFormatSelectExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
