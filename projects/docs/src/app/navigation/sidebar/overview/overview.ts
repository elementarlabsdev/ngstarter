import { Component } from '@angular/core';
import { BasicSidebarExample } from '../_examples/basic-sidebar-example/basic-sidebar-example';
import { Playground } from '@meta/playground/playground';
import {
  SidebarWithCustomIconsExample
} from '../_examples/sidebar-with-custom-icons-example/sidebar-with-custom-icons-example';
import {
  OnlyCompactSidebarExample
} from '../_examples/only-compact-sidebar-example/only-compact-sidebar-example';
import {
  DynamicCompactSidebarExample
} from '../_examples/dynamic-compact-sidebar-example/dynamic-compact-sidebar-example';

@Component({
  imports: [
    BasicSidebarExample,
    DynamicCompactSidebarExample,
    Playground,
    OnlyCompactSidebarExample,
    SidebarWithCustomIconsExample,
  ],
  templateUrl: './overview.html',
})
export class Overview {

}
