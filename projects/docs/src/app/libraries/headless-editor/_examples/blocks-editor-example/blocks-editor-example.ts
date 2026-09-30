import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  basicTextEditorPlugin,
  createNgsHeadlessEditorId,
  createNgsHeadlessEditorParagraph,
  defineNgsHeadlessEditorPlugin,
  getNgsHeadlessEditorBlockText,
  NgsHeadlessEditor,
  NgsHeadlessEditorBlock,
  NgsHeadlessEditorCommand,
  NgsHeadlessEditorCommandDirective,
  NgsHeadlessEditorSurface,
  provideNgsHeadlessEditor,
  withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';

/** One command with a typed payload switches the selected blocks to any registered type. */
const setBlockType: NgsHeadlessEditorCommand<string> = {
  id: 'set-block-type',
  execute: (editor, type) => !editor.isBlockActive(type) && editor.toggleBlock(type),
  enabled: editor => editor.canEditBlocks(),
  active: (editor, type) => editor.isBlockActive(type)
};

/** An atomic block: no text content, rendered by the plugin and skipped by the caret. */
function createDivider(): NgsHeadlessEditorBlock<null> {
  return { id: createNgsHeadlessEditorId('divider'), type: 'divider', content: null };
}

const documentBlocksPlugin = defineNgsHeadlessEditorPlugin({
  id: 'document-blocks',
  blocks: [
    {
      type: 'heading',
      tagName: 'h3',
      create: () => createNgsHeadlessEditorParagraph()
    },
    {
      // The block element is <ul>, the editable text lives in a nested <li>.
      type: 'bulletItem',
      tagName: 'ul',
      contentTagName: 'li',
      create: () => ({ ...createNgsHeadlessEditorParagraph(), type: 'bulletItem' })
    },
    {
      type: 'codeLine',
      tagName: 'pre',
      contentTagName: 'code',
      create: () => ({ ...createNgsHeadlessEditorParagraph(), type: 'codeLine' })
    },
    {
      type: 'divider',
      tagName: 'div',
      editable: false,
      create: createDivider,
      render: element => element.append(element.ownerDocument.createElement('hr')),
      // Without isEmpty a document that only contains a divider would count as empty.
      isEmpty: () => false
    }
  ],
  commands: [setBlockType]
});

@Component({
  selector: 'app-blocks-editor-example',
  imports: [Button, NgsHeadlessEditorSurface, NgsHeadlessEditorCommandDirective],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(documentBlocksPlugin)
    )
  ],
  templateUrl: './blocks-editor-example.html',
  styleUrl: './blocks-editor-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlocksEditorExample {
  readonly editor = inject(NgsHeadlessEditor);
  readonly setBlockType = setBlockType;
  readonly blockText = getNgsHeadlessEditorBlockText;
  readonly types = [
    { type: 'paragraph', label: 'Paragraph' },
    { type: 'heading', label: 'Heading' },
    { type: 'bulletItem', label: 'Bullet' },
    { type: 'codeLine', label: 'Code' }
  ];

  constructor() {
    this.editor.setDocument({
      version: 1,
      blocks: [
        { ...createNgsHeadlessEditorParagraph('Deployment checklist'), type: 'heading' },
        { ...createNgsHeadlessEditorParagraph('Run database migrations'), type: 'bulletItem' },
        { ...createNgsHeadlessEditorParagraph('Warm up the cache'), type: 'bulletItem' },
        createDivider(),
        { ...createNgsHeadlessEditorParagraph('npm run build:prod'), type: 'codeLine' },
        createNgsHeadlessEditorParagraph('Place the caret in a block and switch its type.')
      ]
    });
  }

  insertDivider(): void {
    // Inserted after the block that holds the caret.
    this.editor.insertBlock(createDivider());
  }

  remove(block: NgsHeadlessEditorBlock): void {
    this.editor.removeBlock(block.id);
  }
}
