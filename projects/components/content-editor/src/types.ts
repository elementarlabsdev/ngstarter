import { NgsHeadlessEditorDocument, NgsHeadlessEditorText, NgsHeadlessEditorBlock } from '@ngstarter-ui/components/headless-editor';
import { InjectionToken, InputSignal, Signal, Type } from '@angular/core';

export const CONTENT_BUILDER = new InjectionToken('CONTENT_BUILDER');
export const CONTENT_EDITOR_BLOCK = new InjectionToken<ReadonlyArray<ContentEditorDataBlock>>('CONTENT_EDITOR_BLOCK');

export interface ContentEditorDataBlock {
  id: Signal<string>;
  getData(): any;
  focus(): void;
  isEmpty(): boolean;
  initialized: Signal<boolean>;
}

export interface ContentEditorBlockEmpty {
  content: any;
  settings: {
    [prop: string]: any;
  }
}

export type ContentEditorDocument = NgsHeadlessEditorDocument;
export type ContentEditorBlock<TContent = unknown> = NgsHeadlessEditorBlock<TContent>;
export type ContentEditorText = readonly NgsHeadlessEditorText[];

export type ContentEditorCalloutVariant = 'note' | 'tip' | 'warning' | 'danger';
export interface ContentEditorCalloutSettings { variant: ContentEditorCalloutVariant; }
export interface ContentEditorToggleContent { title: ContentEditorText; blocks: readonly ContentEditorBlock[]; }
export interface ContentEditorToggleSettings { expanded: boolean; }
export interface ContentEditorAttachmentContent { url: string; name: string; size: number; mimeType: string; }
export interface ContentEditorGalleryImage { id: string; src: string; alt: string; caption: ContentEditorText; }
export interface ContentEditorGalleryContent { images: readonly ContentEditorGalleryImage[]; }
export interface ContentEditorColumn { id: string; blocks: readonly ContentEditorBlock[]; }
export interface ContentEditorColumnsContent { columns: readonly ContentEditorColumn[]; }
/** A block collection in the root document, a toggle, or a column. */
export interface ContentEditorBlockScope { parentId?: string; columnId?: string; }
/** Destination passed to the shared block menu; omission of afterId appends to the collection. */
export interface ContentEditorBlockInsertionTarget { scope: ContentEditorBlockScope; afterId?: string; }
export type ContentEditorUploadFn = (file: File, dataUrl: string) => Promise<string>;

/** UI input view of a native document block. Never used as the saved document. */
export interface ContentEditorBlockView {
  id: string;
  type: string;
  content: any;
  isEmpty: boolean;
  attrs?: Readonly<Record<string, unknown>>;
  props?: ContentEditorItemProperty[],
  settings: any;
}

export interface ContentEditorBlockDef {
  component: () => any,
  type: string,
  empty: () => ContentEditorBlockEmpty,
  options: {
    [prop: string]: any;
  }
}

export interface ContentEditorHeadingBlockSettings {
  level: number;
}

export interface ContentEditorSuggestionHeading {
  type: 'item' | 'heading';
  title: string;
}

export interface ContentEditorSuggestionItem {
  type: 'item' | 'heading';
  title: string;
  description: string;
  iconName: string;
  hotKeys: string;
  blockType: string;
  blockOptions: object;
}

export interface ContentEditorImageContent {
  src: string;
  alt: string;
  [prop: string]: any;
}

export interface ContentEditorVideoContent {
  src: string;
  caption: string;
  orientation?: 'portrait' | 'landscape';
  [prop: string]: any;
}

export interface ContentEditorEmbedContent {
  url: string;
  type: string;
}

export interface ContentEditorImageBlockSettings {
  // uploadFn: (file: File, base64: string | ArrayBuffer | null) => Promise<ContentEditorImageContent>;
  width?: number;
  height?: number;
  actualWidth?: number;
  actualHeight?: number;
}

export interface ContentEditorVideoBlockSettings {
  width?: number;
  height?: number;
  actualWidth?: number;
  actualHeight?: number;
}

export interface ContentEditorEmbedBlockSettings {
  width: number | null;
  height: number | null;
}

export interface ContentEditorListItem {
  content: ContentEditorText;
  props?: ContentEditorItemProperty[];
  children: ContentEditorListItem[];
  [prop: string]: any;
}

export interface ContentEditorListSettings {
  listStyle: string;
}

export interface ContentEditorItemProperty {
  name: string;
  value: string;
}

export interface ContentEditorTableBlockSettings {
}

export interface ContentEditorOptions {
  [prop: string]: any;
}

export interface ContentEditorBlockRendererDef {
  type: string;
  component: Type<unknown>;
}

export interface ContentEditorBlockRendererInputs<TContent = unknown, TSettings = unknown> extends Record<string, unknown> {
  block: NgsHeadlessEditorBlock | null;
  id: string;
  type: string;
  content: TContent;
  props: ContentEditorItemProperty[];
  settings: TSettings;
  index: number;
}

export interface ContentEditorBlockRendererInputSignals<TContent = unknown, TSettings = unknown> {
  block: InputSignal<NgsHeadlessEditorBlock | null>;
  id: InputSignal<string>;
  type: InputSignal<string>;
  content: InputSignal<TContent>;
  props: InputSignal<ContentEditorItemProperty[]>;
  settings: InputSignal<TSettings>;
  index: InputSignal<number>;
}
