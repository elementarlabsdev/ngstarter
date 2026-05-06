import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicThumbnailMaker } from '../_examples/basic-thumbnail-maker/basic-thumbnail-maker';
import {
  ThumbnailMakerWithHelperTextExample
} from '../_examples/thumbnail-maker-with-helper-text-example/thumbnail-maker-with-helper-text-example';
import {
  ThumbnailMakerWithFileSelectExample
} from '../_examples/thumbnail-maker-with-file-select-example/thumbnail-maker-with-file-select-example';

@Component({
  selector: 'app-overview',
  imports: [
    Playground,
    BasicThumbnailMaker,
    ThumbnailMakerWithHelperTextExample,
    ThumbnailMakerWithFileSelectExample
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview {

}
