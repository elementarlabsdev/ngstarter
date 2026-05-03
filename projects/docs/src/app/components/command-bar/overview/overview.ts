import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicCommandBarExample
} from '../_examples/basic-command-bar-example/basic-command-bar-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicCommandBarExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
