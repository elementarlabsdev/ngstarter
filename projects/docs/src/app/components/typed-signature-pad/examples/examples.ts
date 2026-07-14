import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicTypedSignaturePadExample
} from '../_examples/basic-typed-signature-pad-example/basic-typed-signature-pad-example';

@Component({
  imports: [
    Playground,
    BasicTypedSignaturePadExample
  ],
  templateUrl: './examples.html',
  styleUrl: './examples.scss'
})
export class Examples {

}
