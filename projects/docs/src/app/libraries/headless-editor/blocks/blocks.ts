import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NativeTable } from '@ngstarter-ui/components/table';
import { RouterLink } from '@angular/router';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { BlocksEditorExample } from '../_examples/blocks-editor-example/blocks-editor-example';

@Component({
  imports: [
    NativeTable,
    RouterLink,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    CodeHighlighter,
    BlocksEditorExample
  ],
  templateUrl: './blocks.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Blocks {
  readonly definitionCode = "const documentBlocksPlugin = defineNgsHeadlessEditorPlugin({\n  id: 'document-blocks',\n  blocks: [\n    {\n      type: 'heading',\n      tagName: 'h3',\n      create: () => createNgsHeadlessEditorParagraph()   // Enter leaves the heading\n    },\n    {\n      type: 'bulletItem',\n      tagName: 'ul',\n      contentTagName: 'li',\n      create: () => ({ ...createNgsHeadlessEditorParagraph(), type: 'bulletItem' })\n    },\n    {\n      type: 'divider',\n      tagName: 'div',\n      editable: false,\n      create: createDivider,\n      render: element => element.append(element.ownerDocument.createElement('hr')),\n      isEmpty: () => false\n    }\n  ]\n});";
  readonly exitCode = "{\n  type: 'blockquote',\n  tagName: 'blockquote',\n  create: () => ({ ...createNgsHeadlessEditorParagraph(), type: 'blockquote' }),\n  // exitOnEmptyEnter: true,   default: Enter on an empty quote line leaves the quote\n  // exitType: 'paragraph'     default: what the empty line becomes\n}";
  readonly operationsCode = "editor.toggleBlock('heading');\neditor.isBlockActive('bulletItem');\neditor.insertBlock({ id: createNgsHeadlessEditorId('divider'), type: 'divider', content: null });\neditor.updateBlock(blockId, { attrs: { level: 2 } });\neditor.removeBlock(blockId);";
  readonly atomicCode = "function createDivider(): NgsHeadlessEditorBlock<null> {\n  return { id: createNgsHeadlessEditorId('divider'), type: 'divider', content: null };\n}\n\nconst image: NgsHeadlessEditorBlock<null> = {\n  id: createNgsHeadlessEditorId('image'),\n  type: 'image',\n  content: null,\n  attrs: { src: '/assets/chart.png', alt: 'Revenue chart' }\n};";
}
