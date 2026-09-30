import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NativeTable } from '@ngstarter-ui/components/table';
import { RouterLink } from '@angular/router';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';
import { Playground } from '@meta/playground/playground';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { TableEditorExample } from '../_examples/table-editor-example/table-editor-example';

@Component({
  imports: [
    NativeTable,
    RouterLink,
    Page,
    PageContentDirective,
    PageTitleDirective,
    Playground,
    CodeHighlighter,
    TableEditorExample
  ],
  templateUrl: './tables.html',
  styleUrl: '../_shared/article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tables {
  readonly setupCode = "import {\n  basicTextEditorPlugin,\n  provideNgsHeadlessEditor,\n  tableEditorPlugin,\n  withHeadlessEditorPlugin\n} from '@ngstarter-ui/components/headless-editor';\n\n@Component({\n  providers: [\n    provideNgsHeadlessEditor(\n      withHeadlessEditorPlugin(basicTextEditorPlugin()),\n      withHeadlessEditorPlugin(tableEditorPlugin())\n    )\n  ]\n})\nexport class DocumentEditor {}";
  readonly modelCode = "{\n  id: 'table-1',\n  type: 'table',\n  content: null,\n  attrs: {\n    header: true,\n    rows: [\n      [\n        [{ type: 'text', text: 'Plan', marks: [] }],\n        [{ type: 'text', text: 'Price', marks: [] }]\n      ],\n      [\n        [{ type: 'text', text: 'Team', marks: [{ type: 'bold' }] }],\n        [{ type: 'text', text: '$49\\nper month', marks: [] }]\n      ]\n    ]\n  }\n}";
  readonly insertCode = "editor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE);                               // 3 x 3, header\neditor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE, { rows: 4, columns: 2, header: false });\n\n// Or build the block yourself:\ninsertNgsHeadlessEditorTable(editor, createNgsHeadlessEditorTable([\n  ['Metric', 'Value'],\n  ['Uptime', '99.98%']\n]));";
  readonly commandsCode = "<button ngsButton=\"outlined\" [ngsHeadlessEditorCommand]=\"insertTable\" [commandData]=\"{ rows: 3, columns: 3, header: true }\">\n  Insert table\n</button>\n<button ngsButton=\"text\" [ngsHeadlessEditorCommand]=\"rowAfter\">Row below</button>\n<button ngsButton=\"text\" [ngsHeadlessEditorCommand]=\"columnAfter\">Column right</button>\n<button ngsButton=\"text\" [ngsHeadlessEditorCommand]=\"toggleHeader\">Header row</button>\n\n<!--\n  readonly insertTable = NGS_HEADLESS_EDITOR_INSERT_TABLE;\n  readonly rowAfter = NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_AFTER;\n  readonly columnAfter = NGS_HEADLESS_EDITOR_TABLE_ADD_COLUMN_AFTER;\n  readonly toggleHeader = NGS_HEADLESS_EDITOR_TABLE_TOGGLE_HEADER;\n-->";
  readonly formattingCode = "withHeadlessEditorPlugin(tableEditorPlugin())                                    // all marks\nwithHeadlessEditorPlugin(tableEditorPlugin({ formatting: ['bold', 'italic', 'link'] })) // some marks\nwithHeadlessEditorPlugin(tableEditorPlugin({ formatting: false }))                 // plain text\n\n// A mark that never appears in nested editors:\n{ type: 'comment', tagName: 'mark', nested: false }";
  readonly programmaticCode = "const block = editor.document().blocks.find(item => item.type === 'table')!;\nlet data = getNgsHeadlessEditorTableData(block);          // normalized cells + header\nconst price = getNgsHeadlessEditorTableCellText(data.rows[1][2]);\n\ndata = setNgsHeadlessEditorTableCell(data, 1, 2, '$9');                         // plain text\ndata = setNgsHeadlessEditorTableCell(data, 0, 0, [\n  createNgsHeadlessEditorText('Plan', [{ type: 'bold' }])                       // or text runs\n]);\ndata = insertNgsHeadlessEditorTableRow(data, data.rows.length);\ndata = removeNgsHeadlessEditorTableColumn(data, 1);\n\neditor.updateBlock(block.id, { attrs: { ...block.attrs, rows: data.rows, header: data.header } });\n\n// Also available: insertNgsHeadlessEditorTableColumn, removeNgsHeadlessEditorTableRow,\n// parseNgsHeadlessEditorTableText (TSV), parseNgsHeadlessEditorTableHtml";
  readonly styleCode = ".surface ::ng-deep {\n  .ngs-headless-editor-table {\n    width: 100%;\n  }\n\n  .ngs-headless-editor-table-cell {\n    padding: 0.5rem 0.75rem;\n    border: 1px solid var(--ngs-color-border);\n    outline: none;\n\n    &.active {\n      box-shadow: inset 0 0 0 2px var(--ngs-color-primary);\n    }\n  }\n\n  th.ngs-headless-editor-table-cell {\n    background: var(--ngs-color-surface-container-low);\n    font-weight: 600;\n  }\n}";
}
