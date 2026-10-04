import { NgsHeadlessEditorMark } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorBlock, ContentEditorText } from '../types';

/** A converter receives saved block data, never an Angular component or editor DOM. */
export type ContentEditorBlockHtmlConverter<T = any> = (block: ContentEditorBlock<T>, context: ContentEditorHtmlContext) => string;
export type ContentEditorMarkHtmlConverter = (html: string, mark: NgsHeadlessEditorMark, context: ContentEditorHtmlContext) => string;
export type ContentEditorHtmlUrlKind = 'link' | 'image' | 'media' | 'attachment' | 'embed';

export interface ContentEditorHtmlContext {
  renderBlock(block: ContentEditorBlock): string;
  renderBlocks(blocks: readonly ContentEditorBlock[]): string;
  renderText(text: ContentEditorText): string;
  /** Calls the built-in converter without re-entering the current override. */
  defaultToHtml(block: ContentEditorBlock): string;
  escape(value: unknown): string;
  safeUrl(value: unknown, kind?: ContentEditorHtmlUrlKind): string | null;
  /** Styles are included once per export, unless includeStyles is false. */
  addStyles(css: string): void;
}
