import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicExpandExample } from '../_examples/basic-expand-example/basic-expand-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import {
  ExpandShowButtonIfExpandedExample
} from '../_examples/expand-show-button-if-expanded-example/expand-show-button-if-expanded-example';
import {
  ExpandCustomButtonLabelsExample
} from '../_examples/expand-custom-button-labels-example/expand-custom-button-labels-example';
import { Tab, TabGroup } from '@ngstarter-ui/components/tabs';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicExpandExample,
    Page,
    PageContentDirective,
    ExpandShowButtonIfExpandedExample,
    ExpandCustomButtonLabelsExample,
    Tab,
    TabGroup,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
