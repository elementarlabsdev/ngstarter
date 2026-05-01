import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
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
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Divider } from '@ngstarter-ui/components/divider';

@Component({
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicImageViewerExample,
    ImageViewerWithCaptionAndDescriptionExample,
    ImageViewerWithTitleExample,
    PageTitleDirective,
    Divider
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
