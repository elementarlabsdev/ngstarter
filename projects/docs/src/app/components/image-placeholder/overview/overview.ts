import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicImagePlaceholderExample
} from '../_examples/basic-image-placeholder-example/basic-image-placeholder-example';

@Component({
  imports: [
    Playground,
    BasicImagePlaceholderExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

}
