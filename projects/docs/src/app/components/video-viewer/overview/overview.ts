import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import {
  BasicVideoViewerExample
} from '../_examples/basic-video-viewer-example/basic-video-viewer-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-video-viewer-overview',
  standalone: true,
  imports: [
    Playground,
    BasicVideoViewerExample,
  ],
  templateUrl: './overview.html'
})
export class Overview {

}
