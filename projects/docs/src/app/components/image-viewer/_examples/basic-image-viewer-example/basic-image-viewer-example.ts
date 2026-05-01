import { Component } from '@angular/core';
import {
  ImageViewerDirective, ImageViewerPictureDirective
} from '@ngstarter-ui/components/image-viewer';

@Component({
  selector: 'app-basic-image-viewer-example',
  imports: [
    ImageViewerDirective,
    ImageViewerPictureDirective
  ],
  templateUrl: './basic-image-viewer-example.html',
  styleUrl: './basic-image-viewer-example.scss'
})
export class BasicImageViewerExample {

}
