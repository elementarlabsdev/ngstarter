import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicFormRendererExample
} from '../_examples/basic-form-renderer-example/basic-form-renderer-example';

@Component({
  imports: [
    Playground,
    BasicFormRendererExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
