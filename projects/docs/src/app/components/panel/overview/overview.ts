import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicPanelExample } from '../_examples/basic-panel-example/basic-panel-example';
import {
  PanelWithExtraColumnsExample
} from '../_examples/panel-with-extra-columns-example/panel-with-extra-columns-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicPanelExample,
    PanelWithExtraColumnsExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
