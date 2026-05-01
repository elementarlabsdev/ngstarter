import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicSuggestionsExample
} from '../_examples/basic-suggestions-example/basic-suggestions-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicSuggestionsExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
