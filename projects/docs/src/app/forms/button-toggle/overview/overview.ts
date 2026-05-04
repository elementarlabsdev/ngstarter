import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicButtonToggleExample
} from '../_examples/basic-button-toggle-example/basic-button-toggle-example';
import {
  ButtonToggleSelectionModeExample
} from '../_examples/button-toggle-selection-mode-example/button-toggle-selection-mode-example';

@Component({
  imports: [
    Playground,
    BasicButtonToggleExample,
    ButtonToggleSelectionModeExample,
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
