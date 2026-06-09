import { Component, signal } from '@angular/core';
import {
  PdfViewer,
  type PdfViewerAnnotationDataSource,
  type PdfViewerAnnotationView,
} from '@ngstarter-ui/components/pdf-viewer';

@Component({
  selector: 'app-basic-pdf-viewer-example',
  imports: [
    PdfViewer
  ],
  templateUrl: './basic-pdf-viewer-example.html',
  styleUrl: './basic-pdf-viewer-example.scss'
})
export class BasicPdfViewerExample {
  readonly src = signal<string | Blob>('/assets/pdf-viewer/sample.pdf');
  readonly documentName = signal('Q3_Financial_Report.pdf');
  readonly wasmUrl = '/assets/embedpdf/pdfium.wasm';
  private readonly clientAnnotations: PdfViewerAnnotationView[] = [
    {
      id: 'apac-growth-note',
      type: 'risk',
      label: 'Comment',
      author: 'Alex M.',
      time: '10:42 AM',
      avatarLabel: 'AM',
      text: 'We need to verify these APAC growth figures against the final audited statements before publishing.',
      pageNumber: 4,
    },
    {
      id: 'margin-review',
      type: 'highlight',
      label: 'Highlight',
      author: 'Jane Doe',
      time: '11:15 AM',
      avatarLabel: 'JD',
      text: 'Total revenue increased by 14% year-over-year...',
      pageNumber: 4,
    },
    {
      id: 'legal-approval',
      type: 'approval',
      label: 'Approval',
      author: 'Jon K.',
      time: '12:16 PM',
      avatarLabel: 'JK',
      text: 'Legal approved the customer quote language after the latest edits.',
      pageNumber: 6,
    },
    {
      id: 'chart-source',
      type: 'comment',
      label: 'Comment',
      author: 'Priya S.',
      time: '1:32 PM',
      avatarLabel: 'PS',
      text: 'Confirm that this chart still points to the latest revenue workbook.',
      pageNumber: 8,
    },
  ];
  readonly annotationsDataSource: PdfViewerAnnotationDataSource = {
    getAnnotations: ({ successCallback }) => {
      setTimeout(() => successCallback(this.clientAnnotations), 250);
    }
  };
}
