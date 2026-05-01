import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicImageZoomViewerExample
} from '../_examples/basic-image-zoom-viewer-example/basic-image-zoom-viewer-example';

@Component({
  selector: 'app-overview',
  imports: [
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    BasicImageZoomViewerExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

}
