import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FileType, FileTypeName } from '@ngstarter-ui/components/file-type';

@Component({
  selector: 'app-file-type-gallery-example',
  imports: [
    FileType
  ],
  templateUrl: './file-type-gallery-example.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './file-type-gallery-example.scss',
})
export class FileTypeGalleryExample {
  types = signal<FileTypeName[]>([
    'pdf',
    'doc',
    'xls',
    'ppt',
    'csv',
    'json',
    'xml',
    'html',
    'txt',
    'jpg',
    'png',
    'svg',
    'mp3',
    'wav',
    'mp4',
    'mov',
    'mkv',
    'webm',
    'avi',
    'zip',
  ]);
}
