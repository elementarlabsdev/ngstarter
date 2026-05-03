import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicBlockLoaderExample
} from '../_examples/basic-block-loader-example/basic-block-loader-example';
import {
  BlockLoaderInModalExample
} from '../_examples/block-loader-in-modal-example/block-loader-in-modal-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicBlockLoaderExample,
    BlockLoaderInModalExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
