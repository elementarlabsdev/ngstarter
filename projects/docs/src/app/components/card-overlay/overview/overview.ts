import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicCardOverlayExample
} from '../_examples/basic-card-overlay-example/basic-card-overlay-example';
import {
  CardOverlayWithTranslateExample
} from '../_examples/card-overlay-with-translate-example/card-overlay-with-translate-example';
import {
  CardOverlayWithBlurExample
} from '../_examples/card-overlay-with-blur-example/card-overlay-with-blur-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Divider } from '@ngstarter/components/divider';

@Component({
    selector: 'app-overview',
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicCardOverlayExample,
    CardOverlayWithTranslateExample,
    CardOverlayWithBlurExample,
    PageTitleDirective,
    Divider
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
