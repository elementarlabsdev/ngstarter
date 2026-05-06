import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicProgressSpinnerExample
} from '../_examples/basic-progress-spinner-example/basic-progress-spinner-example';
import {
  ConfigurableSpinnerExample
} from '../_examples/configurable-spinner-example/configurable-spinner-example';

@Component({
  imports: [
    Playground,
    BasicProgressSpinnerExample,
    ConfigurableSpinnerExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
