import { InjectionToken, Signal } from '@angular/core';

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

export interface ContentEditorBlock {
  id: string;
  type: string;
  content: any;
  isEmpty: boolean;
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
  content: string;
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
