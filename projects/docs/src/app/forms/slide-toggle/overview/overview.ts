import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicSlideToggleExample
} from '../_examples/basic-slide-toggle-example/basic-slide-toggle-example';
import {
  SlideToggleDisabledExample
} from '../_examples/slide-toggle-disabled-example/slide-toggle-disabled-example';
import {
  SlideToggleWithFormsExample
} from '../_examples/slide-toggle-with-forms-example/slide-toggle-with-forms-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicSlideToggleExample,
    SlideToggleDisabledExample,
    SlideToggleWithFormsExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
