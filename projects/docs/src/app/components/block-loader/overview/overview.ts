import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicBlockLoaderExample
} from '../_examples/basic-block-loader-example/basic-block-loader-example';
import {
  BlockLoaderInModalExample
} from '../_examples/block-loader-in-modal-example/block-loader-in-modal-example';

@Component({
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    BasicBlockLoaderExample,
    BlockLoaderInModalExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
