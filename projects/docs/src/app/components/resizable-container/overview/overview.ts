import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicResizableContainerExample
} from '../_examples/basic-resizable-container-example/basic-resizable-container-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicResizableContainerExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
