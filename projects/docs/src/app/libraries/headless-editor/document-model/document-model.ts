import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { JsonInspectorExample } from '../_examples/json-inspector-example/json-inspector-example';

@Component({
  imports: [
    RouterLink,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    CodeHighlighter,
    JsonInspectorExample
  ],
  templateUrl: './document-model.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentModel {
  readonly structureCode = "const document: NgsHeadlessEditorDocument = {\n  version: 1,\n  blocks: [\n    {\n      id: 'paragraph-1',\n      type: 'paragraph',\n      content: [\n        { type: 'text', text: 'Hello ', marks: [] },\n        { type: 'text', text: 'world', marks: [{ type: 'bold' }] }\n      ]\n    },\n    {\n      id: 'callout-1',\n      type: 'callout',\n      content: null,                          // atomic block\n      attrs: { tone: 'info', text: 'Heads up' }\n    }\n  ]\n};\n\nconst selection: NgsHeadlessEditorSelection = {\n  anchor: { blockId: 'paragraph-1', offset: 6 },\n  focus: { blockId: 'paragraph-1', offset: 11 }  // selects \"world\"\n};";
  readonly immutableCode = "const before = editor.document();\neditor.insertText('!');               // edits the block that holds the caret\nconst after = editor.document();\n\nbefore === after;                      // false: a new document\nbefore.blocks[1] === after.blocks[1];  // true: untouched blocks are shared";
  readonly helpersCode = "import {\n  cloneNgsHeadlessEditorDocument,      // deep copy for external mutation\n  createNgsHeadlessEditorDocument,     // document with one paragraph\n  createNgsHeadlessEditorId,           // unique id with a prefix\n  createNgsHeadlessEditorParagraph,    // paragraph block\n  createNgsHeadlessEditorText,         // normalized text run\n  getNgsHeadlessEditorBlockText,       // text of one block\n  getNgsHeadlessEditorDocumentText,    // blocks joined with newlines\n  isNgsHeadlessEditorDocumentEmpty,    // true when only whitespace\n  isNgsHeadlessEditorTextContent,      // type guard for text blocks\n  ngsHeadlessEditorBlocksEqual,\n  ngsHeadlessEditorDocumentsEqual,\n  ngsHeadlessEditorMarksEqual,\n  ngsHeadlessEditorValuesEqual,        // JSON-like deep equality\n  normalizeNgsHeadlessEditorDocument,\n  normalizeNgsHeadlessEditorMarks,\n  normalizeNgsHeadlessEditorTextContent\n} from '@ngstarter-ui/components/headless-editor';\n\nconst document = createNgsHeadlessEditorDocument('First line');\nconst text = getNgsHeadlessEditorDocumentText(document);         // 'First line'\nconst same = ngsHeadlessEditorDocumentsEqual(document, cloneNgsHeadlessEditorDocument(document)); // true";
}
