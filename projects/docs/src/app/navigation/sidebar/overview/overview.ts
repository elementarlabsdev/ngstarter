import { Component } from '@angular/core';
import { BasicSidebarExample } from '../_examples/basic-sidebar-example/basic-sidebar-example';
import { Playground } from '@meta/playground/playground';
import {
  SidebarWithCustomIconsExample
} from '../_examples/sidebar-with-custom-icons-example/sidebar-with-custom-icons-example';

@Component({
  imports: [
    BasicSidebarExample,
    Playground,
    SidebarWithCustomIconsExample,
  ],
  templateUrl: './overview.html',
})
export class Overview {

}
