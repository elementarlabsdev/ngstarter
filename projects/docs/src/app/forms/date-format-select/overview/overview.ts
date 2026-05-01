import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicDateFormatSelectExample
} from '../_examples/basic-date-format-select-example/basic-date-format-select-example';

@Component({
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    BasicDateFormatSelectExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
