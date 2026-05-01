import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { BasicTilesExample } from '../_examples/basic-tiles-example/basic-tiles-example';

@Component({
  selector: 'app-overview',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    BasicTilesExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

}
