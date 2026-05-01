import { Component } from '@angular/core';
import { ImageZoomViewer, ImageZoomViewerImage } from '@ngstarter/components/image-zoom-viewer';

@Component({
  selector: 'app-basic-image-zoom-viewer-example',
  standalone: true,
  imports: [ImageZoomViewer, ImageZoomViewerImage],
  templateUrl: './basic-image-zoom-viewer-example.html',
  styleUrl: './basic-image-zoom-viewer-example.scss',
})
export class BasicImageZoomViewerExample {

}
