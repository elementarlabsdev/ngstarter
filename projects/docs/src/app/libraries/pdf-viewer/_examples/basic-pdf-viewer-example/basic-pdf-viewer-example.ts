import { Component } from '@angular/core';
import { PdfViewer } from '@ngstarter-ui/components/pdf-viewer';

@Component({
  selector: 'app-basic-pdf-viewer-example',
  imports: [
    PdfViewer
  ],
  templateUrl: './basic-pdf-viewer-example.html',
  styleUrl: './basic-pdf-viewer-example.scss'
})
export class BasicPdfViewerExample {
  readonly src = '/assets/pdf-viewer/sample.pdf';
  readonly wasmUrl = '/assets/embedpdf/pdfium.wasm';
}
