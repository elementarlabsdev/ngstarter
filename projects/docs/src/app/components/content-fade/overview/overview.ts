import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicContentFadeExample
} from '../_examples/basic-content-fade-example/basic-content-fade-example';
import {
  ContentFadeCustomWidthExample
} from '../_examples/content-fade-custom-width-example/content-fade-custom-width-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import {
  ContentFadeCustomPositionExample
} from '../_examples/content-fade-custom-position-example/content-fade-custom-position-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicContentFadeExample,
    ContentFadeCustomWidthExample,
    ContentFadeCustomPositionExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
