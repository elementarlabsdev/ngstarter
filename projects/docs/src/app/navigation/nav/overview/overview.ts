import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicNavigationExample
} from '../_examples/basic-navigation-example/basic-navigation-example';
import {
  NavigationWithHeadingExample
} from '../_examples/navigation-with-heading-example/navigation-with-heading-example';
import {
  NavigationWithDividerExample
} from '../_examples/navigation-with-divider-example/navigation-with-divider-example';
import {
  NavigationWithIconsExample
} from '../_examples/navigation-with-icons-example/navigation-with-icons-example';
import {
  NavigationWithNestedMenuExample
} from '../_examples/navigation-with-nested-menu-example/navigation-with-nested-menu-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import {
  NavigationWithBadgesExample
} from '../_examples/navigation-with-badges-example/navigation-with-badges-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicNavigationExample,
    NavigationWithHeadingExample,
    NavigationWithDividerExample,
    NavigationWithIconsExample,
    NavigationWithNestedMenuExample,
    Page,
    PageContentDirective,
    NavigationWithBadgesExample,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
