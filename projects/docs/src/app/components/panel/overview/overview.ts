import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicPanelExample } from '../_examples/basic-panel-example/basic-panel-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import {
  PanelWithExtraColumnsExample
} from '../_examples/panel-with-extra-columns-example/panel-with-extra-columns-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicPanelExample,
    Page,
    PageContentDirective,
    PageTitleDirective,
    PanelWithExtraColumnsExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
