import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import { BasicConfirmExample } from '../_examples/basic-confirm-example/basic-confirm-example';
import {
  ConfirmFormModalExample
} from '../_examples/confirm-form-modal-example/confirm-form-modal-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicConfirmExample,
    ConfirmFormModalExample,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
