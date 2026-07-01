import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import {
  ExternalRendererFlowExample
} from '../_examples/external-renderer-flow-example/external-renderer-flow-example';

@Component({
  imports: [
    ExternalRendererFlowExample,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground
  ],
  templateUrl: './external-renderer-flow.html',
  styleUrl: './external-renderer-flow.scss'
})
export class ExternalRendererFlow {
}
