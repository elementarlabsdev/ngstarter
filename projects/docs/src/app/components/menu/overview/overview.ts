import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicMenuExample } from '../_examples/basic-menu-example/basic-menu-example';
import { MenuWithIconsExample } from '../_examples/menu-with-icons-example/menu-with-icons-example';
import { NestedMenuExample } from '../_examples/nested-menu-example/nested-menu-example';
import {
  MenuPositioningExample
} from '../_examples/menu-positioning-example/menu-positioning-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { ContextMenuExample } from '../_examples/context-menu-example/context-menu-example';
import { LazyRenderingExample } from '../_examples/lazy-rendering-example/lazy-rendering-example';
import { MenuDividerExample } from '../_examples/menu-divider-example/menu-divider-example';
import { MenuHeadingExample } from '../_examples/menu-heading-example/menu-heading-example';
import {
  MenuHeaderFooterExample
} from '../_examples/menu-header-footer-example/menu-header-footer-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicMenuExample,
    MenuWithIconsExample,
    NestedMenuExample,
    MenuPositioningExample,
    Page,
    PageContentDirective,
    PageTitleDirective,
    ContextMenuExample,
    LazyRenderingExample,
    MenuDividerExample,
    MenuHeadingExample,
    MenuHeaderFooterExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
