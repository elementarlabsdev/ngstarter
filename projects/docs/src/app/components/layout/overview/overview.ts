import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { LayoutHeaderExample } from '../_examples/layout-header-example/layout-header-example';
import { LayoutSidebarExample } from '../_examples/layout-sidebar-example/layout-sidebar-example';
import {
  LayoutHeaderWithSidebarExample
} from '../_examples/layout-header-with-sidebar-example/layout-header-with-sidebar-example';
import {
  LayoutHeaderWithTopbarExample
} from '../_examples/layout-header-with-topbar-example/layout-header-with-topbar-example';
import { LayoutFooterExample } from '../_examples/layout-footer-example/layout-footer-example';
import {
  LayoutHeaderWithFooterExample
} from '../_examples/layout-header-with-footer-example/layout-header-with-footer-example';
import {
  LayoutWithNestedLayoutsExample
} from '../_examples/layout-with-nested-layouts-example/layout-with-nested-layouts-example';
import { LayoutAsideExample } from '../_examples/layout-aside-example/layout-aside-example';

@Component({
  imports: [
    Playground,
    LayoutHeaderExample,
    LayoutSidebarExample,
    LayoutHeaderWithSidebarExample,
    LayoutHeaderWithTopbarExample,
    LayoutFooterExample,
    LayoutHeaderWithFooterExample,
    LayoutWithNestedLayoutsExample,
    LayoutAsideExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
