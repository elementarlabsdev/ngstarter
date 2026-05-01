import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicProgressSpinnerExample
} from '../_examples/basic-progress-spinner-example/basic-progress-spinner-example';
import {
  ConfigurableSpinnerExample
} from '../_examples/configurable-spinner-example/configurable-spinner-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicProgressSpinnerExample,
    ConfigurableSpinnerExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
