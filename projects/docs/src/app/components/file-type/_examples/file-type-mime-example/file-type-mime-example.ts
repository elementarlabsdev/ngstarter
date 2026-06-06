import { Component, signal } from '@angular/core';
import { FileType, FileTypeName } from '@ngstarter-ui/components/file-type';

type FileTypeMimeExampleItem = {
  name: string;
  mimeType: string;
  fallback: FileTypeName;
};

@Component({
  selector: 'app-file-type-mime-example',
  imports: [
    FileType
  ],
  templateUrl: './file-type-mime-example.html',
  styleUrl: './file-type-mime-example.scss',
})
export class FileTypeMimeExample {
  files = signal<FileTypeMimeExampleItem[]>([
    { name: 'Brand mark', mimeType: 'image/svg+xml', fallback: 'txt' },
    { name: 'Podcast cut', mimeType: 'audio/mpeg', fallback: 'txt' },
    { name: 'Campaign deck', mimeType: 'application/vnd.ms-powerpoint', fallback: 'txt' },
    { name: 'Raw export', mimeType: 'application/octet-stream', fallback: 'zip' },
  ]);
}
