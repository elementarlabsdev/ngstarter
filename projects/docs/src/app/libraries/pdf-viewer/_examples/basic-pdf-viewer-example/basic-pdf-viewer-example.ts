import { Component, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { PdfViewer } from '@ngstarter-ui/components/pdf-viewer';

@Component({
  selector: 'app-basic-pdf-viewer-example',
  imports: [
    Button,
    Icon,
    PdfViewer
  ],
  templateUrl: './basic-pdf-viewer-example.html',
  styleUrl: './basic-pdf-viewer-example.scss'
})
export class BasicPdfViewerExample {
  readonly src = signal<string | Blob>('/assets/pdf-viewer/sample.pdf');
  readonly wasmUrl = '/assets/embedpdf/pdfium.wasm';

  onPdfSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.item(0);
    inputElement.value = '';

    if (file) {
      this.src.set(file);
    }
  }
}
