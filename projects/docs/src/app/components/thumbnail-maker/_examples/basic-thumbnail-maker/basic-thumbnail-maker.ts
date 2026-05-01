import { Component } from '@angular/core';
import { ThumbnailMaker } from '@ngstarter-ui/components/thumbnail-maker';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-basic-thumbnail-maker',
  imports: [
    ThumbnailMaker,
    Button
  ],
  templateUrl: './basic-thumbnail-maker.html',
  styleUrl: './basic-thumbnail-maker.scss'
})
export class BasicThumbnailMaker {
  thumbnail = '';

  makeThumbnail(thumbnailMaker: ThumbnailMaker): void {
    this.thumbnail = thumbnailMaker.api.getDataUrl();
  }
}
