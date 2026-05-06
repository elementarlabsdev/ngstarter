import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicScreenLoaderExample
} from '../_examples/basic-screen-loader-example/basic-screen-loader-example';

@Component({
  imports: [
    Playground,
    BasicScreenLoaderExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {
}
