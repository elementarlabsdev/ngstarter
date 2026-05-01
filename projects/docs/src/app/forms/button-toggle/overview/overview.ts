import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicButtonToggleExample
} from '../_examples/basic-button-toggle-example/basic-button-toggle-example';
import {
  ButtonToggleSelectionModeExample
} from '../_examples/button-toggle-selection-mode-example/button-toggle-selection-mode-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicButtonToggleExample,
    ButtonToggleSelectionModeExample,
    Page,
    PageContentDirective,
    PageTitleDirective,
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
