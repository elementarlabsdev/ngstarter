import { Component } from '@angular/core';
import {
  ImageViewerDirective,
  ImageViewerPictureCaptionDirective, ImageViewerPictureDescriptionDirective,
  ImageViewerPictureDirective
} from '@ngstarter-ui/components/image-viewer';

@Component({
  selector: 'app-image-viewer-with-caption-and-description-example',
  imports: [
    ImageViewerDirective,
    ImageViewerPictureDirective,
    ImageViewerPictureCaptionDirective,
    ImageViewerPictureDescriptionDirective
  ],
  templateUrl: './image-viewer-with-caption-and-description-example.html',
  styleUrl: './image-viewer-with-caption-and-description-example.scss'
})
export class ImageViewerWithCaptionAndDescriptionExample {

}
