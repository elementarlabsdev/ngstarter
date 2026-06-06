import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicFileTypeExample } from '../_examples/basic-file-type-example/basic-file-type-example';
import { FileTypeGalleryExample } from '../_examples/file-type-gallery-example/file-type-gallery-example';
import { FileTypeMimeExample } from '../_examples/file-type-mime-example/file-type-mime-example';
import { FileTypeSizesExample } from '../_examples/file-type-sizes-example/file-type-sizes-example';

@Component({
  imports: [
    Playground,
    BasicFileTypeExample,
    FileTypeGalleryExample,
    FileTypeMimeExample,
    FileTypeSizesExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

}
