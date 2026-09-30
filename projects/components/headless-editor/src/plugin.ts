import type { Provider, Type } from '@angular/core';
import type { NgsHeadlessEditor } from './headless-editor';
import { NgsHeadlessEditorBlock, NgsHeadlessEditorMark } from './model';

export interface NgsHeadlessEditorCommand<TPayload = void> {
  readonly id: string;
  execute(editor: NgsHeadlessEditor, payload: TPayload): boolean;
  enabled?(editor: NgsHeadlessEditor, payload: TPayload): boolean;
  active?(editor: NgsHeadlessEditor, payload: TPayload): boolean;
}

export interface NgsHeadlessEditorKeyBinding<TPayload = unknown> {
  readonly key: string;
  readonly command: NgsHeadlessEditorCommand<TPayload> | string;
  readonly payload?: TPayload;
}

export interface NgsHeadlessEditorMarkDefinition {
  readonly type: string;
  readonly tagName: string;
  readonly parseTags?: readonly string[];
  /**
   * Whether the mark is available in nested editors such as table cells.
   * Default: true. Set false for marks that only make sense in the main text.
   */
  readonly nested?: boolean;
  /** An indivisible inline token: its text cannot be edited and deletion removes the whole token. */
  readonly atomic?: boolean;
  applyAttributes?(element: HTMLElement, mark: NgsHeadlessEditorMark): void;
  readAttributes?(element: HTMLElement): NgsHeadlessEditorMark['attrs'];
}

export interface NgsHeadlessEditorBlockDefinition<TContent = unknown> {
  readonly type: string;
  readonly tagName: string;
  readonly contentTagName?: string;
  readonly editable?: boolean;
  /**
   * Enter on an empty block of this type leaves the block: the empty line is
   * replaced by a block of `exitType` (paragraph by default). This is what makes
   * "Enter, Enter" leave a quote, a list or a code block. Defaults to true for
   * every text block whose type differs from `exitType`; set false to keep
   * creating empty blocks of the same type.
   */
  readonly exitOnEmptyEnter?: boolean;
  /** Block type used when leaving this block. Defaults to 'paragraph'. */
  readonly exitType?: string;
  /**
   * Creates an empty block of this type. Enter on a non-empty block uses it for
   * the block that follows, so return a paragraph to leave the type after one
   * Enter (headings) or the same type to continue it (quotes, list items).
   */
  create(): NgsHeadlessEditorBlock<TContent>;
  render?(element: HTMLElement, block: NgsHeadlessEditorBlock<TContent>): void;
  read?(element: HTMLElement, previous: NgsHeadlessEditorBlock<TContent>): NgsHeadlessEditorBlock<TContent>;
  isEmpty?(block: NgsHeadlessEditorBlock<TContent>): boolean;
  /**
   * Angular component rendered as the block while the surface is editable. The
   * block element becomes its host (`tagName`), is non-editable for the browser,
   * and the component receives the block through a `block` input when it declares
   * one. It can inject `NgsHeadlessEditor` and call `updateBlock()` to change its data.
   * The instance is kept while the block id and type stay the same.
   */
  readonly editorComponent?: Type<unknown>;
  /** Component used instead of `editorComponent` while the surface is read-only or disabled. */
  readonly rendererComponent?: Type<unknown>;
}

/** Recommended shape for `editorComponent` / `rendererComponent` implementations. */
export interface NgsHeadlessEditorBlockComponent<TContent = unknown> {
  readonly block: () => NgsHeadlessEditorBlock<TContent>;
}

export interface NgsHeadlessEditorPlugin {
  readonly id: string;
  readonly blocks?: readonly NgsHeadlessEditorBlockDefinition[];
  readonly marks?: readonly NgsHeadlessEditorMarkDefinition[];
  readonly commands?: readonly NgsHeadlessEditorCommand<unknown>[];
  readonly keymap?: readonly NgsHeadlessEditorKeyBinding[];
  readonly providers?: readonly Provider[];
  handlePaste?(event: ClipboardEvent, editor: NgsHeadlessEditor): boolean;
  setup?(editor: NgsHeadlessEditor): void | (() => void);
}

export interface NgsHeadlessEditorFeature {
  readonly plugin: NgsHeadlessEditorPlugin;
}

export function defineNgsHeadlessEditorPlugin<TPlugin extends NgsHeadlessEditorPlugin>(plugin: TPlugin): TPlugin {
  return plugin;
}

export function withHeadlessEditorPlugin(plugin: NgsHeadlessEditorPlugin): NgsHeadlessEditorFeature {
  return { plugin };
}
