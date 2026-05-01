import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicCookiePopupExample
} from '../_examples/basic-cookie-popup-example/basic-cookie-popup-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicCookiePopupExample,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
