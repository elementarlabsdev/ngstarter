import { Component } from '@angular/core';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter-ui/components/upload';
import { JsonPipe } from '@angular/common';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-basic-upload-example',
  imports: [
    JsonPipe,
    UploadTriggerDirective,
    Button
  ],
  templateUrl: './basic-upload-example.html',
  styleUrl: './basic-upload-example.scss'
})
export class BasicUploadExample {
  files: any = [];

  onFileSelected(event: UploadFileSelectedEvent) {
    this.files = event.files.map(rawFile => {
      return {
        name: rawFile.name,
        size: rawFile.size
      }
    });
  }
}
