export type PdfViewerSource = string | ArrayBuffer | Uint8Array | Blob | null | undefined;

export interface PdfViewerLoadedEvent {
  pageCount: number;
}

export interface PdfViewerPageRenderedEvent {
  pageNumber: number;
  url: string;
  width?: number;
  height?: number;
}

export interface PdfViewerPageView {
  pageNumber: number;
  url: string;
  width: number;
  height: number;
  textGlyphs: PdfViewerTextGlyphView[];
}

export interface PdfViewerThumbnailView {
  pageNumber: number;
  url: string;
  width: number;
  height: number;
}

export interface PdfViewerTextRectView {
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PdfViewerTextGlyphView {
  index: number;
  left: number;
  top: number;
  width: number;
  height: number;
  lineTop: number;
  lineHeight: number;
  lineId: number;
}

export interface PdfViewerSelectionRectView extends PdfViewerTextRectView {
  pageNumber: number;
}
