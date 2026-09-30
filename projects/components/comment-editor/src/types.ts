import { InjectionToken } from '@angular/core';
import {
  NgsHeadlessEditor,
  NgsHeadlessEditorDocument,
  NgsHeadlessEditorMarkAttributes
} from '@ngstarter-ui/components/headless-editor';

export interface CommentEditorInterface {
  readonly api: CommentEditorAPI;
}

export interface CommentEditorAPI {
  isCommandDisabled(command: string): boolean | null;
  isActive(command: string): boolean;
  runCommand(command: string): void;
  editor(): NgsHeadlessEditor;
  document(): NgsHeadlessEditorDocument;
  isToolbarActive(): boolean;
  toggleToolbar(): void;
  showToolbar(): void;
  hideToolbar(): void;
  isEditorActivated(): boolean;
  showFullView(): void;
  hideFullView(): void;
  insertText(text: string): void;
  insertImage(file: File): void;
  insertYoutube(url: string): boolean;
  getMarkAttributes(type: string): NgsHeadlessEditorMarkAttributes | undefined;
  setTextColor(color: string): boolean;
  unsetTextColor(): boolean;
  setBackgroundColor(color: string): boolean;
  unsetBackgroundColor(): boolean;
  setLink(url: string): boolean;
  unsetLink(): boolean;
  clear(): void;
  focus(): void;
}

export const COMMENT_EDITOR = new InjectionToken<CommentEditorInterface>('COMMENT_EDITOR');
export const COMMENT_EDITOR_BUBBLE_MENU = new InjectionToken('COMMENT_EDITOR_BUBBLE_MENU');
