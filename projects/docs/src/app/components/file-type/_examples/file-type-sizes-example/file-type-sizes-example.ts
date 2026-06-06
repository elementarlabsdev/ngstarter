import { Component, signal } from '@angular/core';
import { FileType } from '@ngstarter-ui/components/file-type';

interface FileTypeSizeExample {
  label: string;
  className: string;
}

@Component({
  selector: 'app-file-type-sizes-example',
  imports: [
    FileType
  ],
  templateUrl: './file-type-sizes-example.html',
  styleUrl: './file-type-sizes-example.scss',
})
export class FileTypeSizesExample {
  sizes = signal<FileTypeSizeExample[]>([
    { label: '24 px', className: 'size-6' },
    { label: '32 px', className: 'size-8' },
    { label: '40 px', className: 'size-10' },
    { label: '48 px', className: 'size-12' },
    { label: '64 px', className: 'size-16' },
    { label: '80 px', className: 'size-20' },
  ]);
}
