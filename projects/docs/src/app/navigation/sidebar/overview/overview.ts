import { Component } from '@angular/core';
import { BasicSidebarExample } from '../_examples/basic-sidebar-example/basic-sidebar-example';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import { Page } from '@meta/page/page';
import {
  SidebarWithCustomIconsExample
} from '../_examples/sidebar-with-custom-icons-example/sidebar-with-custom-icons-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    BasicSidebarExample,
    PageContentDirective,
    Playground,
    Page,
    SidebarWithCustomIconsExample,
    PageTitleDirective,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
