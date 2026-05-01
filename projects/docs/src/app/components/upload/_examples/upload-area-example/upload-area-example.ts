import { Component } from '@angular/core';
import {
  UploadAllowedTypes,
  UploadArea,
  UploadAreaDropStateDirective,
  UploadAreaIconDirective,
  UploadAreaInvalidStateDirective,
  UploadAreaMainStateDirective,
  UploadContainer,
  UploadFileSelectedEvent,
  UploadMaxFileSize,
  UploadTriggerDirective
} from '@ngstarter-ui/components/upload';
import { JsonPipe } from '@angular/common';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'app-upload-area-example',
  imports: [
    JsonPipe,
    UploadArea,
    Icon,
    UploadAreaIconDirective,
    UploadTriggerDirective,
    UploadAllowedTypes,
    UploadMaxFileSize,
    UploadContainer,
    UploadAreaMainStateDirective,
    UploadAreaDropStateDirective,
    UploadAreaInvalidStateDirective
  ],
  templateUrl: './upload-area-example.html',
  styleUrl: './upload-area-example.scss'
})
export class UploadAreaExample {
  files: any[] = [];

  onFileSelected(event: UploadFileSelectedEvent): void {
    this.files = event.files.map(rawFile => {
      return {
        name: rawFile.name,
        size: rawFile.size
      }
    });
  }
}
