import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicSidePanelExample
} from '../_examples/basic-side-panel-example/basic-side-panel-example';

@Component({
  imports: [
    Playground,
    BasicSidePanelExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
