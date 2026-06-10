import type { Observable } from 'rxjs';

export type PdfViewerSource = string | ArrayBuffer | Uint8Array | Blob | null | undefined;

export interface PdfViewerAnnotationDataSourceContext {
  source: PdfViewerSource;
  documentName: string | null;
  pageCount: number;
}

export interface PdfViewerAnnotationDataSourceParams extends PdfViewerAnnotationDataSourceContext {
  successCallback(annotations: PdfViewerAnnotationView[]): void;
  failCallback(error?: unknown): void;
}

export interface PdfViewerServerAnnotationDataSource {
  getAnnotations(params: PdfViewerAnnotationDataSourceParams): void;
}

export type PdfViewerAnnotationDataSourceResult =
  | PdfViewerAnnotationView[]
  | Promise<PdfViewerAnnotationView[]>
  | Observable<PdfViewerAnnotationView[]>;

export type PdfViewerAnnotationDataSource =
  | PdfViewerAnnotationDataSourceResult
  | PdfViewerServerAnnotationDataSource
  | ((params: PdfViewerAnnotationDataSourceContext) => PdfViewerAnnotationDataSourceResult);

export type PdfViewerAnnotationWhen =
  | string
  | ((annotation: PdfViewerAnnotationView, index: number) => boolean);

export interface PdfViewerAnnotationTemplateContext {
  $implicit: PdfViewerAnnotationView;
  annotation: PdfViewerAnnotationView;
  index: number;
  goToPage(pageNumber: number): void;
}

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
  url: string | null;
  scale: number;
  renderedScale: number | null;
  rotation?: number;
  renderedRotation?: number | null;
  width: number;
  height: number;
  isRendering: boolean;
  textGlyphs: PdfViewerTextGlyphView[];
}

export interface PdfViewerThumbnailView {
  pageNumber: number;
  url: string;
  width: number;
  height: number;
}

export interface PdfViewerAnnotationView {
  id?: string | number;
  type?: string;
  label?: string;
  author: string;
  time?: string;
  avatarUrl?: string;
  avatarLabel?: string;
  text: string;
  pageNumber: number;
  replyLabel?: string;
  [key: string]: unknown;
}

export interface PdfViewerSearchResultView {
  id?: string | number;
  pageNumber: number;
  excerpt: string;
}

export interface PdfViewerSearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
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
