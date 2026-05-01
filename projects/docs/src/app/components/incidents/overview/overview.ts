import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicIncidentsExample } from '../_examples/basic-incidents-example/basic-incidents-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import {
  IncidentsShowHideDynamiclyExample
} from '../_examples/incidents-show-hide-dynamicly-example/incidents-show-hide-dynamicly-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicIncidentsExample,
    Page,
    PageContentDirective,
    IncidentsShowHideDynamiclyExample,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
