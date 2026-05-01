import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  TabPanelWithPanelsInsideExample
} from '../_examples/tab-panel-with-panels-inside-example/tab-panel-with-panels-inside-example';
import { BasicTabPanelExample } from '../_examples/basic-tab-panel-example/basic-tab-panel-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import {
  TabPanelCompactExample
} from '../_examples/tab-panel-compact-example/tab-panel-compact-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
    selector: 'app-overview',
  imports: [
    Playground,
    TabPanelWithPanelsInsideExample,
    BasicTabPanelExample,
    Page,
    PageContentDirective,
    TabPanelCompactExample,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
