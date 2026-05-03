import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicBreadcrumbsExample
} from '../_examples/basic-breadcrumbs-example/basic-breadcrumbs-example';
import {
  BreadcrumbsWithDatasourceExample
} from '../_examples/breadcrumbs-with-datasource-example/breadcrumbs-with-datasource-example';
import {
  BreadcrumbsWithIconsExample
} from '../_examples/breadcrumbs-with-icons-example/breadcrumbs-with-icons-example';
import {
  BreadcrumbsWithTitlesExample
} from '../_examples/breadcrumbs-with-titles-example/breadcrumbs-with-titles-example';
import {
  BreadcrumbsWithLastItemAsLinkExample
} from '../_examples/breadcrumbs-with-last-item-as-link-example/breadcrumbs-with-last-item-as-link-example';
import {
  BreadcrumbsGlobalExample
} from '../_examples/breadcrumbs-global-example/breadcrumbs-global-example';

@Component({
  imports: [
    Playground,
    BasicBreadcrumbsExample,
    BreadcrumbsWithDatasourceExample,
    BreadcrumbsWithIconsExample,
    BreadcrumbsWithTitlesExample,
    BreadcrumbsWithLastItemAsLinkExample,
    BreadcrumbsGlobalExample,
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
