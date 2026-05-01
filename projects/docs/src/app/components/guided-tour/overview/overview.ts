import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { BasicGuidedTourExample } from '../_examples/basic-guided-tour-example/basic-guided-tour-example';
import { BackdropGuidedTourExample } from '../_examples/backdrop-guided-tour-example/backdrop-guided-tour-example';
import { WaitForGuidedTourExample } from '../_examples/wait-for-guided-tour-example/wait-for-guided-tour-example';
import { CloseOnBackdropClickExample } from '../_examples/close-on-backdrop-click-example/close-on-backdrop-click-example';
import { TemplateGuidedTourExample } from '../_examples/template-guided-tour-example/template-guided-tour-example';
import { CustomButtonsGuidedTourExample } from '../_examples/custom-buttons-guided-tour-example/custom-buttons-guided-tour-example';
import { GlobalConfigGuidedTourExample } from '../_examples/global-config-guided-tour-example/global-config-guided-tour-example';
import { KeyboardNavigationGuidedTourExample } from '../_examples/keyboard-navigation-guided-tour-example/keyboard-navigation-guided-tour-example';
import { PositioningGuidedTourExample } from '../_examples/positioning-guided-tour-example/positioning-guided-tour-example';
import { RouteNavigationGuidedTourExample } from '../_examples/route-navigation-guided-tour-example/route-navigation-guided-tour-example';

@Component({
  selector: 'app-overview',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    BasicGuidedTourExample,
    BackdropGuidedTourExample,
    WaitForGuidedTourExample,
    CloseOnBackdropClickExample,
    TemplateGuidedTourExample,
    CustomButtonsGuidedTourExample,
    GlobalConfigGuidedTourExample,
    KeyboardNavigationGuidedTourExample,
    PositioningGuidedTourExample,
    RouteNavigationGuidedTourExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

}
