import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { DataViewEmbeddedExample } from '../_examples/data-view-embedded-example/data-view-embedded-example';

@Component({
  selector: 'app-embedded',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    DataViewEmbeddedExample
  ],
  templateUrl: './embedded.html',
  styleUrl: './embedded.scss'
})
export class DataViewEmbedded {
}
