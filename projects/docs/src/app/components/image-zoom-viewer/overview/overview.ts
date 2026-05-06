import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicImageZoomViewerExample
} from '../_examples/basic-image-zoom-viewer-example/basic-image-zoom-viewer-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicImageZoomViewerExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

}
