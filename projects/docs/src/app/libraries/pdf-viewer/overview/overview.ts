import { Component } from '@angular/core';
import { Playground } from '@meta/playground/playground';
import { BasicPdfViewerExample } from '../_examples/basic-pdf-viewer-example/basic-pdf-viewer-example';

@Component({
  selector: 'app-pdf-viewer-overview',
  imports: [
    Playground,
    BasicPdfViewerExample,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {

}
