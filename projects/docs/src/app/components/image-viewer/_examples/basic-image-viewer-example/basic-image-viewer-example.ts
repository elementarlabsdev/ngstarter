import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-image-viewer-example.scss'
})
export class BasicImageViewerExample {

}
