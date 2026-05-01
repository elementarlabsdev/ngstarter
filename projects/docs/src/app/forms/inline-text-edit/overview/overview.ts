import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicInlineTextEditExample
} from '../_examples/basic-inline-text-edit-example/basic-inline-text-edit-example';

@Component({
  selector: 'app-overview',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    BasicInlineTextEditExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
