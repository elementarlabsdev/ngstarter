import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ImagePlaceholder } from '@ngstarter-ui/components/image-placeholder';

@Component({
  selector: 'app-basic-image-placeholder-example',
  imports: [
    ImagePlaceholder
  ],
  templateUrl: './basic-image-placeholder-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './basic-image-placeholder-example.scss',
})
export class BasicImagePlaceholderExample {

}
