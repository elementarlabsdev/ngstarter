import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicButtonsExample } from '../_examples/basic-buttons-example/basic-buttons-example';
import { StrokedButtonsExample } from '../_examples/stroked-buttons-example/stroked-buttons-example';
import { FlatButtonsExample } from '../_examples/flat-buttons-example/flat-buttons-example';
import { IconButtonsExample } from '../_examples/icon-buttons-example/icon-buttons-example';
import { ButtonLoadingExample } from '../_examples/button-loading-example/button-loading-example';
import { Page } from '@meta/page/page';
import { PageAsideDirective } from '@meta/page/page-aside.directive';
import {
  ButtonsWithInteractiveDisabledExample
} from '../_examples/buttons-with-interactive-disabled-example/buttons-with-interactive-disabled-example';
import {
  ScrollSpyBackToTop,
  ScrollSpyNav,
  ScrollSpyOn,
  ScrollSpyTitle
} from '@ngstarter-ui/components/scroll-spy';
import { TonalButtonsExample } from '../_examples/tonal-buttons-example/tonal-buttons-example';
import { HideTextOnMobileExample } from '../_examples/hide-text-on-mobile-example/hide-text-on-mobile-example';

@Component({
  imports: [
    Playground,
    BasicButtonsExample,
    StrokedButtonsExample,
    FlatButtonsExample,
    IconButtonsExample,
    ButtonLoadingExample,
    PageAsideDirective,
    ButtonsWithInteractiveDisabledExample,
    ScrollSpyNav,
    ScrollSpyTitle,
    ScrollSpyOn,
    TonalButtonsExample,
    HideTextOnMobileExample,
    ScrollSpyBackToTop
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
