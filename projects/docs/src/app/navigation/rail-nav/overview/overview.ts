import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import { BasicRailNavExample } from '../_examples/basic-rail-nav-example/basic-rail-nav-example';
import {
  RailNavCustomizationExample
} from '../_examples/rail-nav-customization-example/rail-nav-customization-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicRailNavExample,
    RailNavCustomizationExample,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
