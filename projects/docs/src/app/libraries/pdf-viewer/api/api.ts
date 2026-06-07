import { Component } from '@angular/core';
import {
  Cell,
  CellDef,
  ColumnDef,
  HeaderCell,
  HeaderCellDef,
  HeaderRow,
  HeaderRowDef,
  Row,
  RowDef,
  Table
} from '@ngstarter-ui/components/table';

@Component({
  selector: 'app-pdf-viewer-api',
  imports: [
    Table,
    HeaderCellDef,
    HeaderCell,
    Cell,
    CellDef,
    ColumnDef,
    HeaderRowDef,
    RowDef,
    HeaderRow,
    Row
  ],
  templateUrl: './api.html',
  styleUrl: './api.scss',
})
export class Api {
  properties = [
    {
      name: 'src',
      description: 'PDF source to render. Accepts a URL string, Blob, ArrayBuffer, Uint8Array, null, or undefined.',
      type: 'string | Blob | ArrayBuffer | Uint8Array | null | undefined',
      default: 'null'
    },
    {
      name: 'wasmUrl',
      description: 'URL for the PDFium WebAssembly file used by EmbedPDF.',
      type: 'string',
      default: '/assets/embedpdf/pdfium.wasm'
    },
    {
      name: 'page',
      description: 'Initial or controlled page number. Values are clamped to the loaded document page range.',
      type: 'number',
      default: '1'
    },
    {
      name: 'scale',
      description: 'Initial or controlled render scale. A value of 1 equals 100%. Values are clamped between minScale and maxScale.',
      type: 'number',
      default: '1'
    },
    {
      name: 'minScale',
      description: 'Minimum zoom scale. The default 0.2 equals 20%.',
      type: 'number',
      default: '0.2'
    },
    {
      name: 'maxScale',
      description: 'Maximum zoom scale. The default 60 equals 6000%.',
      type: 'number',
      default: '60'
    },
    {
      name: 'zoomStep',
      description: 'Amount added or removed by the built-in zoom controls.',
      type: 'number',
      default: '0.1'
    },
    {
      name: 'renderAll',
      description: 'Render every page when true. Render only the active page when false.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'showToolbar',
      description: 'Show built-in page navigation and zoom controls.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'showPageList',
      description: 'Show the left page list inside the viewer panel.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'showPageNumbers',
      description: 'Show a small page label above each rendered page.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'withAnnotations',
      description: 'Render PDF annotations when supported by the document.',
      type: 'boolean',
      default: 'true'
    },
    {
      name: 'withForms',
      description: 'Render interactive form widgets when supported by the document.',
      type: 'boolean',
      default: 'true'
    }
  ];

  events = [
    {
      name: 'loaded',
      description: 'Emitted after the PDF document opens.',
      type: 'PdfViewerLoadedEvent'
    },
    {
      name: 'pageChanged',
      description: 'Emitted when built-in controls or the main document scroll change the active page.',
      type: 'number'
    },
    {
      name: 'pageRendered',
      description: 'Emitted after a page render completes and an object URL with display dimensions is created.',
      type: 'PdfViewerPageRenderedEvent'
    },
    {
      name: 'error',
      description: 'Emitted when the PDF engine, document load, or render operation fails.',
      type: 'unknown'
    }
  ];
}
