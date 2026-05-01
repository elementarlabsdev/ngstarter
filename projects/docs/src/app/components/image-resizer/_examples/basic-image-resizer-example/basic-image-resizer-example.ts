import { Component, signal } from '@angular/core';
import {
  ImageResizedEvent,
  ImageResizer,
  ImageResizerImageDirective
} from '@ngstarter/components/image-resizer';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-basic-image-resizer-example',
  imports: [
    ImageResizer,
    JsonPipe,
    ImageResizerImageDirective
  ],
  templateUrl: './basic-image-resizer-example.html',
  styleUrl: './basic-image-resizer-example.scss'
})
export class BasicImageResizerExample {
  imageDimensionsInfo = signal<ImageResizedEvent | null>(null);

  onImageResized(event: ImageResizedEvent) {
    this.imageDimensionsInfo.set(event);
  }
}
