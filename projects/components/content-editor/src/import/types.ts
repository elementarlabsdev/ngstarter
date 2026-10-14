import type { NgsHeadlessEditorMarkDefinition } from '@ngstarter-ui/components/headless-editor';
import type { ContentEditorBlock, ContentEditorText, ContentEditorBlockInsertionTarget } from '../types';
import type { ContentEditorHtmlUrlKind } from '../html/types';

export interface ContentEditorImportOptions {
  /** Maximum JSON/HTML nesting depth. Default: 64. */
  maxDepth?: number;
  /** Maximum number of document blocks, including nested blocks. Default: 10000. */
  maxBlocks?: number;
  /** Preserve application-defined JSON block types. Default: false. */
  allowUnknownBlocks?: boolean;
}

export interface ContentEditorImportPlacement {
  /** Replace the document (default), or insert into a block collection. */
  mode?: 'replace' | 'insert';
  /** Defaults to the active collection and block when inserting. */
  target?: ContentEditorBlockInsertionTarget;
}

export interface ContentEditorHtmlImportOptions extends ContentEditorImportOptions {
  /** A DOM document supplied by the application, useful for server-side parsers. */
  document?: Document;
}

export interface ContentEditorHtmlImportContext {
  createBlock(type: string, content: unknown, attrs?: Readonly<Record<string, unknown>>): ContentEditorBlock;
  createId(prefix?: string): string;
  parseBlocks(element: Element): readonly ContentEditorBlock[];
  parseText(element: Element): ContentEditorText;
  /** Uses the built-in parser for this element without invoking the override again. */
  defaultFromHtml(element: Element): readonly ContentEditorBlock[];
  safeUrl(value: unknown, kind?: ContentEditorHtmlUrlKind): string | null;
}

export interface ContentEditorBlockHtmlImporter {
  /** CSS selector matched against the source element. Overrides run before built-ins. */
  selector: string;
  parse(element: Element, context: ContentEditorHtmlImportContext): ContentEditorBlock | readonly ContentEditorBlock[] | null;
}

/** Return an error message to reject a block, or undefined to accept it. */
export type ContentEditorBlockImportValidator = (block: ContentEditorBlock) => string | undefined;

/** Structured failure. The editor is never modified when parsing fails. */
export class ContentEditorImportError extends Error {
  constructor(readonly path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = 'ContentEditorImportError';
  }
}

export type ContentEditorImportMarkDefinition = NgsHeadlessEditorMarkDefinition;
