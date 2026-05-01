import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicUploadExample } from '../_examples/basic-upload-example/basic-upload-example';
import { UploadAreaExample } from '../_examples/upload-area-example/upload-area-example';
import { FileListExample } from '../_examples/file-list-example/file-list-example';
import { FileGridExample } from '../_examples/file-grid-example/file-grid-example';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  imports: [
    Playground,
    BasicUploadExample,
    UploadAreaExample,
    FileListExample,
    FileGridExample,
    Page,
    PageContentDirective,
    PageTitleDirective
  ],
    templateUrl: './overview.html',
    styleUrl: './overview.scss'
})
export class Overview {

}
