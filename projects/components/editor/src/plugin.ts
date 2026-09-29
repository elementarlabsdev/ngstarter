import type { Provider, Type } from '@angular/core';
import type { NgsEditor } from './editor';
import { NgsEditorBlock, NgsEditorMark } from './model';

export interface NgsEditorCommand<TPayload = void> {
  readonly id: string;
  execute(editor: NgsEditor, payload: TPayload): boolean;
  enabled?(editor: NgsEditor, payload: TPayload): boolean;
  active?(editor: NgsEditor, payload: TPayload): boolean;
}

export interface NgsEditorKeyBinding<TPayload = unknown> {
  readonly key: string;
  readonly command: NgsEditorCommand<TPayload> | string;
  readonly payload?: TPayload;
}

export interface NgsEditorMarkDefinition {
  readonly type: string;
  readonly tagName: string;
  readonly parseTags?: readonly string[];
  applyAttributes?(element: HTMLElement, mark: NgsEditorMark): void;
  readAttributes?(element: HTMLElement): NgsEditorMark['attrs'];
}

export interface NgsEditorBlockDefinition<TContent = unknown> {
  readonly type: string;
  readonly tagName: string;
  readonly contentTagName?: string;
  readonly editable?: boolean;
  create(): NgsEditorBlock<TContent>;
  render?(element: HTMLElement, block: NgsEditorBlock<TContent>): void;
  read?(element: HTMLElement, previous: NgsEditorBlock<TContent>): NgsEditorBlock<TContent>;
  isEmpty?(block: NgsEditorBlock<TContent>): boolean;
  readonly editorComponent?: Type<unknown>;
  readonly rendererComponent?: Type<unknown>;
}

export interface NgsEditorPlugin {
  readonly id: string;
  readonly blocks?: readonly NgsEditorBlockDefinition[];
  readonly marks?: readonly NgsEditorMarkDefinition[];
  readonly commands?: readonly NgsEditorCommand<unknown>[];
  readonly keymap?: readonly NgsEditorKeyBinding[];
  readonly providers?: readonly Provider[];
  handlePaste?(event: ClipboardEvent, editor: NgsEditor): boolean;
  setup?(editor: NgsEditor): void | (() => void);
}

export interface NgsEditorFeature {
  readonly plugin: NgsEditorPlugin;
}

export function defineNgsEditorPlugin<TPlugin extends NgsEditorPlugin>(plugin: TPlugin): TPlugin {
  return plugin;
}

export function withEditorPlugin(plugin: NgsEditorPlugin): NgsEditorFeature {
  return { plugin };
}
