import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { BasicDataviewExample } from '../_examples/basic-dataview-example/basic-dataview-example';

@Component({
  selector: 'app-basic-dataview',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    BasicDataviewExample
  ],
  templateUrl: './basic-dataview.html',
  styleUrl: './basic-dataview.scss'
})
export class BasicDataview {
}
