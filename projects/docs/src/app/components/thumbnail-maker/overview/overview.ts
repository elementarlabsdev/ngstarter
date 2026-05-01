import { Component } from '@angular/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { Playground } from '@meta/playground/playground';
import { BasicThumbnailMaker } from '../_examples/basic-thumbnail-maker/basic-thumbnail-maker';
import {
  ThumbnailMakerWithHelperTextExample
} from '../_examples/thumbnail-maker-with-helper-text-example/thumbnail-maker-with-helper-text-example';
import {
  ThumbnailMakerWithFileSelectExample
} from '../_examples/thumbnail-maker-with-file-select-example/thumbnail-maker-with-file-select-example';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-overview',
  imports: [
    Page,
    PageContentDirective,
    Playground,
    BasicThumbnailMaker,
    ThumbnailMakerWithHelperTextExample,
    ThumbnailMakerWithFileSelectExample,
    PageTitleDirective
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
