import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {
  basicTextEditorPlugin,
  colorEditorPlugin,
  NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR,
  NGS_HEADLESS_EDITOR_TOGGLE_BOLD,
  NGS_HEADLESS_EDITOR_TOGGLE_CODE,
  NGS_HEADLESS_EDITOR_TOGGLE_ITALIC,
  NGS_HEADLESS_EDITOR_TOGGLE_STRIKE,
  NGS_HEADLESS_EDITOR_UNSET_BACKGROUND_COLOR,
  createNgsHeadlessEditorParagraph,
  createNgsHeadlessEditorTable,
  createNgsHeadlessEditorText,
  NGS_HEADLESS_EDITOR_INSERT_TABLE,
  NGS_HEADLESS_EDITOR_TABLE_ADD_COLUMN_AFTER,
  NGS_HEADLESS_EDITOR_TABLE_ADD_COLUMN_BEFORE,
  NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_AFTER,
  NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_BEFORE,
  NGS_HEADLESS_EDITOR_TABLE_DELETE,
  NGS_HEADLESS_EDITOR_TABLE_DELETE_COLUMN,
  NGS_HEADLESS_EDITOR_TABLE_DELETE_ROW,
  NGS_HEADLESS_EDITOR_TABLE_TOGGLE_HEADER,
  NgsHeadlessEditor,
  NgsHeadlessEditorCommandDirective,
  NgsHeadlessEditorSurface,
  NgsHeadlessEditorTableSize,
  ngsHeadlessEditorActiveTableCell,
  provideNgsHeadlessEditor,
  tableEditorPlugin,
  withHeadlessEditorPlugin
} from '@ngstarter-ui/components/headless-editor';

@Component({
  selector: 'app-table-editor-example',
  imports: [Button, NgsHeadlessEditorSurface, NgsHeadlessEditorCommandDirective],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(colorEditorPlugin()),
      // Cells accept every formatting command unless you pass e.g. { formatting: ['bold', 'italic'] }.
      withHeadlessEditorPlugin(tableEditorPlugin())
    )
  ],
  templateUrl: './table-editor-example.html',
  styleUrl: './table-editor-example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableEditorExample {
  readonly editor = inject(NgsHeadlessEditor);
  /** The focused (or last focused) cell; table commands act on it. */
  readonly activeCell = ngsHeadlessEditorActiveTableCell(this.editor);
  readonly bold = NGS_HEADLESS_EDITOR_TOGGLE_BOLD;
  readonly italic = NGS_HEADLESS_EDITOR_TOGGLE_ITALIC;
  readonly strike = NGS_HEADLESS_EDITOR_TOGGLE_STRIKE;
  readonly code = NGS_HEADLESS_EDITOR_TOGGLE_CODE;
  readonly highlight = NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR;
  readonly unhighlight = NGS_HEADLESS_EDITOR_UNSET_BACKGROUND_COLOR;
  readonly insertTable = NGS_HEADLESS_EDITOR_INSERT_TABLE;
  readonly size: NgsHeadlessEditorTableSize = { rows: 3, columns: 3, header: true };
  readonly rowBefore = NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_BEFORE;
  readonly rowAfter = NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_AFTER;
  readonly columnBefore = NGS_HEADLESS_EDITOR_TABLE_ADD_COLUMN_BEFORE;
  readonly columnAfter = NGS_HEADLESS_EDITOR_TABLE_ADD_COLUMN_AFTER;
  readonly deleteRow = NGS_HEADLESS_EDITOR_TABLE_DELETE_ROW;
  readonly deleteColumn = NGS_HEADLESS_EDITOR_TABLE_DELETE_COLUMN;
  readonly toggleHeader = NGS_HEADLESS_EDITOR_TABLE_TOGGLE_HEADER;
  readonly deleteTable = NGS_HEADLESS_EDITOR_TABLE_DELETE;

  constructor() {
    this.editor.setDocument({
      version: 1,
      blocks: [
        createNgsHeadlessEditorParagraph('Pricing'),
        createNgsHeadlessEditorTable([
          ['Plan', 'Seats', 'Price'],
          ['Starter', '1', '$0'],
          [
            [createNgsHeadlessEditorText('Team', [{ type: 'bold' }])],
            '10',
            [createNgsHeadlessEditorText('$49', [{ type: 'backgroundColor', attrs: { color: '#fef08a' } }])]
          ]
        ]),
        createNgsHeadlessEditorParagraph('Click a cell and format it with the same toolbar and shortcuts as the text. Tab moves between cells, Escape leaves a cell, and a range pasted from a spreadsheet becomes a table.')
      ]
    });
  }
}
