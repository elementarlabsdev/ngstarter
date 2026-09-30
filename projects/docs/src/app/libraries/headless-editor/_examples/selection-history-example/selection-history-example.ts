import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  basicTextEditorPlugin,
  createNgsHeadlessEditorDocument,
  getNgsHeadlessEditorBlockText,
  NGS_HEADLESS_EDITOR_TOGGLE_BOLD,
  NgsHeadlessEditor,
  NgsHeadlessEditorCommandDirective,
  NgsHeadlessEditorSurface,
  provideNgsHeadlessEditor,
  withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';

@Component({
  selector: 'app-selection-history-example',
  imports: [JsonPipe, Button, NgsHeadlessEditorSurface, NgsHeadlessEditorCommandDirective],
  providers: [provideNgsHeadlessEditor(withHeadlessEditorPlugin(basicTextEditorPlugin()))],
  templateUrl: './selection-history-example.html',
  styleUrl: './selection-history-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectionHistoryExample {
  readonly editor = inject(NgsHeadlessEditor);
  readonly surface = viewChild.required(NgsHeadlessEditorSurface);
  readonly bold = NGS_HEADLESS_EDITOR_TOGGLE_BOLD;

  constructor() {
    this.editor.setDocument({
      version: 1,
      blocks: [
        ...createNgsHeadlessEditorDocument('Type a few words: consecutive characters form one undo step.').blocks,
        ...createNgsHeadlessEditorDocument('A space, a pause or a caret move starts the next one.').blocks
      ]
    });
  }

  selectAll(): void {
    const blocks = this.editor.document().blocks;
    const last = blocks[blocks.length - 1];
    this.editor.setSelection({
      anchor: { blockId: blocks[0].id, offset: 0 },
      focus: { blockId: last.id, offset: getNgsHeadlessEditorBlockText(last).length }
    });
    // Programmatic selections live in the model; focus() mirrors them into the DOM.
    this.surface().focus();
  }

  caretToEnd(): void {
    const last = this.editor.document().blocks.at(-1)!;
    const offset = getNgsHeadlessEditorBlockText(last).length;
    this.editor.setSelection({
      anchor: { blockId: last.id, offset },
      focus: { blockId: last.id, offset }
    });
    this.surface().focus();
  }

  insertTimestamp(): void {
    // API edits replace the current selection and are recorded as their own undo step.
    this.editor.insertText(` [${new Date().toLocaleTimeString()}] `, 'api');
    this.surface().focus();
  }

  loadKeepingHistory(): void {
    // resetHistory = false keeps the undo stack, so the load itself can be undone.
    this.editor.setDocument(createNgsHeadlessEditorDocument('Loaded from the server.'), false);
  }
}
