import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  basicTextEditorPlugin,
  createNgsHeadlessEditorId,
  createNgsHeadlessEditorParagraph,
  createNgsHeadlessEditorText,
  defineNgsHeadlessEditorPlugin,
  NGS_HEADLESS_EDITOR_TOGGLE_BOLD,
  NGS_HEADLESS_EDITOR_TOGGLE_CODE,
  NGS_HEADLESS_EDITOR_TOGGLE_ITALIC,
  NGS_HEADLESS_EDITOR_TOGGLE_STRIKE,
  NgsHeadlessEditor,
  NgsHeadlessEditorCommand,
  NgsHeadlessEditorCommandDirective,
  NgsHeadlessEditorSurface,
  provideNgsHeadlessEditor,
  withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tooltip } from '@ngstarter-ui/components/tooltip';

/** Block commands are plain objects: execute, plus optional enabled and active predicates. */
const toggleHeading: NgsHeadlessEditorCommand = {
  id: 'toggle-heading',
  execute: editor => editor.toggleBlock('heading'),
  enabled: editor => editor.canEditBlocks(),
  active: editor => editor.isBlockActive('heading')
};

const toggleQuote: NgsHeadlessEditorCommand = {
  id: 'toggle-quote',
  execute: editor => editor.toggleBlock('blockquote'),
  enabled: editor => editor.canEditBlocks(),
  active: editor => editor.isBlockActive('blockquote')
};

/** History is exposed as signals, so undo/redo fit the same command contract. */
const undo: NgsHeadlessEditorCommand = {
  id: 'undo',
  execute: editor => editor.undo(),
  enabled: editor => editor.canUndo()
};

const redo: NgsHeadlessEditorCommand = {
  id: 'redo',
  execute: editor => editor.redo(),
  enabled: editor => editor.canRedo()
};

const toolbarBlocksPlugin = defineNgsHeadlessEditorPlugin({
  id: 'toolbar-blocks',
  blocks: [
    {
      type: 'heading',
      tagName: 'h2',
      // create() is the block produced when Enter splits this block:
      // pressing Enter at the end of a heading continues with a paragraph.
      create: () => createNgsHeadlessEditorParagraph()
    },
    {
      type: 'blockquote',
      tagName: 'blockquote',
      create: () => ({ ...createNgsHeadlessEditorParagraph(), type: 'blockquote' })
    }
  ],
  commands: [toggleHeading, toggleQuote, undo, redo],
  keymap: [
    { key: 'Mod-Alt-2', command: toggleHeading },
    { key: 'Mod-Shift-9', command: toggleQuote }
  ]
});

@Component({
  selector: 'app-toolbar-editor-example',
  imports: [Button, Icon, Tooltip, NgsHeadlessEditorSurface, NgsHeadlessEditorCommandDirective],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(toolbarBlocksPlugin)
    )
  ],
  templateUrl: './toolbar-editor-example.html',
  styleUrl: './toolbar-editor-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarEditorExample {
  readonly editor = inject(NgsHeadlessEditor);
  readonly bold = NGS_HEADLESS_EDITOR_TOGGLE_BOLD;
  readonly italic = NGS_HEADLESS_EDITOR_TOGGLE_ITALIC;
  readonly strike = NGS_HEADLESS_EDITOR_TOGGLE_STRIKE;
  readonly code = NGS_HEADLESS_EDITOR_TOGGLE_CODE;
  readonly heading = toggleHeading;
  readonly quote = toggleQuote;
  readonly undo = undo;
  readonly redo = redo;

  constructor() {
    this.editor.setDocument({
      version: 1,
      blocks: [
        { ...createNgsHeadlessEditorParagraph('Release notes'), type: 'heading' },
        {
          id: createNgsHeadlessEditorId('paragraph'),
          type: 'paragraph',
          content: [
            createNgsHeadlessEditorText('Select text and use the toolbar or '),
            createNgsHeadlessEditorText('keyboard shortcuts', [{ type: 'bold' }]),
            createNgsHeadlessEditorText('. Buttons reflect the state at the caret.')
          ]
        },
        {
          ...createNgsHeadlessEditorParagraph('The toolbar is plain Angular markup bound to typed commands.'),
          type: 'blockquote'
        }
      ]
    });
  }
}
