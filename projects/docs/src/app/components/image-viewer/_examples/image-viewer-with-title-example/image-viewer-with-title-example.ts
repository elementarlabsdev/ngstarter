import { Component } from '@angular/core';
import {
  ImageViewerDirective,
  ImageViewerPictureCaptionDirective,
  ImageViewerPictureDescriptionDirective,
  ImageViewerPictureDirective,
  ImageViewerPictureTitleDirective
} from '@ngstarter-ui/components/image-viewer';

@Component({
  selector: 'app-image-viewer-with-title-example',
  imports: [
    ImageViewerDirective,
    ImageViewerPictureCaptionDirective,
    ImageViewerPictureDescriptionDirective,
    ImageViewerPictureDirective,
    ImageViewerPictureTitleDirective
  ],
  templateUrl: './image-viewer-with-title-example.html',
  styleUrl: './image-viewer-with-title-example.scss'
})
export class ImageViewerWithTitleExample {

}
