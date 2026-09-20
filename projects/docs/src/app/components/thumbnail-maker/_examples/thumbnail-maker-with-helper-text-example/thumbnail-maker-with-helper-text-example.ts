import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ThumbnailMaker } from '@ngstarter-ui/components/thumbnail-maker';

@Component({
  selector: 'app-thumbnail-maker-with-helper-text-example',
  imports: [
    ThumbnailMaker
  ],
  templateUrl: './thumbnail-maker-with-helper-text-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './thumbnail-maker-with-helper-text-example.scss'
})
export class ThumbnailMakerWithHelperTextExample {

}
