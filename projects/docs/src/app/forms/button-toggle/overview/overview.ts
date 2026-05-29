import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicButtonToggleExample
} from '../_examples/basic-button-toggle-example/basic-button-toggle-example';
import {
  ButtonToggleSelectionModeExample
} from '../_examples/button-toggle-selection-mode-example/button-toggle-selection-mode-example';
import {
  IconOnlyButtonToggleExample
} from '../_examples/icon-only-button-toggle-example/icon-only-button-toggle-example';

@Component({
  imports: [
    Playground,
    BasicButtonToggleExample,
    ButtonToggleSelectionModeExample,
    IconOnlyButtonToggleExample,
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
