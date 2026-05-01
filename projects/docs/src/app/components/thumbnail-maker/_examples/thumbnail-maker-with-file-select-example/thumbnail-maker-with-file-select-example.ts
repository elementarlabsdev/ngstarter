import { Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { ThumbnailMaker } from '@ngstarter-ui/components/thumbnail-maker';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter-ui/components/upload';

@Component({
  selector: 'app-thumbnail-maker-with-file-select-example',
  imports: [
    Button,
    ThumbnailMaker,
    UploadTriggerDirective
  ],
  templateUrl: './thumbnail-maker-with-file-select-example.html',
  styleUrl: './thumbnail-maker-with-file-select-example.scss'
})
export class ThumbnailMakerWithFileSelectExample {
  src = '';
  thumbnail = '';

  makeThumbnail(thumbnailMaker: ThumbnailMaker): void {
    this.thumbnail = thumbnailMaker.api.getDataUrl();
  }

  onImageSelected(event: UploadFileSelectedEvent) {
    const reader = new FileReader();
    reader.onload = () => {
      this.src = reader.result as string;
    };
    reader.readAsDataURL(event.files[0]);
  }
}
