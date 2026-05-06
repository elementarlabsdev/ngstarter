import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicExpandExample } from '../_examples/basic-expand-example/basic-expand-example';
import {
  ExpandShowButtonIfExpandedExample
} from '../_examples/expand-show-button-if-expanded-example/expand-show-button-if-expanded-example';
import {
  ExpandCustomButtonLabelsExample
} from '../_examples/expand-custom-button-labels-example/expand-custom-button-labels-example';

@Component({
  imports: [
    Playground,
    BasicExpandExample,
    ExpandShowButtonIfExpandedExample,
    ExpandCustomButtonLabelsExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
