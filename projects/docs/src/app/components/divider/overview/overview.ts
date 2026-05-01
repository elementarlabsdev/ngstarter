import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { DividerOverviewExample } from '../_examples/divider-overview-example/divider-overview-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { TextDividerExample } from '../_examples/text-divider-example/text-divider-example';

@Component({
  imports: [
    Playground,
    Page,
    PageContentDirective,
    DividerOverviewExample,
    PageTitleDirective,
    TextDividerExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
