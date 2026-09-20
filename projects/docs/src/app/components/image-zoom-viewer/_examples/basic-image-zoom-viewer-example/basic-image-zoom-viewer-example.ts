import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ImageZoomViewer, ImageZoomViewerImage } from '@ngstarter-ui/components/image-zoom-viewer';

@Component({
  selector: 'app-basic-image-zoom-viewer-example',
  standalone: true,
  imports: [ImageZoomViewer, ImageZoomViewerImage],
  templateUrl: './basic-image-zoom-viewer-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-image-zoom-viewer-example.scss',
})
export class BasicImageZoomViewerExample {

}
