import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import {
  BasicImageViewerExample
} from '../_examples/basic-image-viewer-example/basic-image-viewer-example';
import {
  ImageViewerWithCaptionAndDescriptionExample
} from '../_examples/image-viewer-with-caption-and-description-example/image-viewer-with-caption-and-description-example';
import {
  ImageViewerWithTitleExample
} from '../_examples/image-viewer-with-title-example/image-viewer-with-title-example';

@Component({
  imports: [
    Playground,
    BasicImageViewerExample,
    ImageViewerWithCaptionAndDescriptionExample,
    ImageViewerWithTitleExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
