import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NativeTable } from '@ngstarter-ui/components/table';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { SelectionHistoryExample } from '../_examples/selection-history-example/selection-history-example';

@Component({
  imports: [
    NativeTable,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    CodeHighlighter,
    SelectionHistoryExample
  ],
  templateUrl: './selection-history.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectionHistory {
  readonly selectionCode = "const [first] = editor.document().blocks;\nconst last = editor.document().blocks.at(-1)!;\n\n// select everything\neditor.setSelection({\n  anchor: { blockId: first.id, offset: 0 },\n  focus: { blockId: last.id, offset: getNgsHeadlessEditorBlockText(last).length }\n});\nsurface.focus();\n\n// caret after the third character of the first block\neditor.setSelection({\n  anchor: { blockId: first.id, offset: 3 },\n  focus: { blockId: first.id, offset: 3 }\n});";
  readonly historyCode = "editor.canUndo();            // signal\neditor.undo();\neditor.redo();\n\n// Load content without clearing the undo stack, so the load can be undone.\neditor.setDocument(serverDocument, false);\n\n// Replace content and clear history.\neditor.clear();";
}
