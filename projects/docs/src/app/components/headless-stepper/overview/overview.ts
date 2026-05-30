import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicHeadlessStepperExample
} from '../_examples/basic-headless-stepper-example/basic-headless-stepper-example';
import {
  LinearHeadlessStepperExample
} from '../_examples/linear-headless-stepper-example/linear-headless-stepper-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicHeadlessStepperExample,
    LinearHeadlessStepperExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
