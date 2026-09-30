import type { NgsHeadlessEditor } from '../headless-editor';
import {
  createNgsHeadlessEditorParagraph,
  getNgsHeadlessEditorBlockText,
  isNgsHeadlessEditorTextContent,
  NgsHeadlessEditorBlock
} from '../model';
import {
  defineNgsHeadlessEditorPlugin,
  NgsHeadlessEditorCommand,
  NgsHeadlessEditorPlugin
} from '../plugin';
import { NgsHeadlessEditorTableBlockEditor } from './table-block/table-block';
import { NgsHeadlessEditorTableView } from './table-view/table-view';
import {
  NGS_HEADLESS_EDITOR_TABLE_OPTIONS,
  ngsHeadlessEditorTableCellMarks,
  NgsHeadlessEditorTablePluginOptions
} from './table.options';
import {
  focusNgsHeadlessEditorTableCell,
  ngsHeadlessEditorActiveTableCell,
  setNgsHeadlessEditorActiveTableCell
} from './table-state';
import {
  createNgsHeadlessEditorTable,
  getNgsHeadlessEditorTableData,
  insertNgsHeadlessEditorTableColumn,
  insertNgsHeadlessEditorTableRow,
  isNgsHeadlessEditorTable,
  NGS_HEADLESS_EDITOR_TABLE_TYPE,
  NgsHeadlessEditorTableCell,
  NgsHeadlessEditorTableData,
  NgsHeadlessEditorTableSize,
  parseNgsHeadlessEditorTableHtml,
  parseNgsHeadlessEditorTableText,
  removeNgsHeadlessEditorTableColumn,
  removeNgsHeadlessEditorTableRow
} from './table.model';

const DEFAULT_SIZE: NgsHeadlessEditorTableSize = { rows: 3, columns: 3, header: true };

interface ActiveTable {
  readonly block: NgsHeadlessEditorBlock;
  readonly data: NgsHeadlessEditorTableData;
  readonly cell: NgsHeadlessEditorTableCell;
}

function activeTable(editor: NgsHeadlessEditor): ActiveTable | null {
  const cell = ngsHeadlessEditorActiveTableCell(editor)();
  if (!cell) {
    return null;
  }
  const block = editor.document().blocks.find(item => item.id === cell.blockId);
  if (!block || !isNgsHeadlessEditorTable(block)) {
    return null;
  }
  const data = getNgsHeadlessEditorTableData(block);
  const row = Math.min(cell.row, data.rows.length - 1);
  const column = Math.min(cell.column, (data.rows[0]?.length ?? 1) - 1);
  return { block, data, cell: { blockId: block.id, row, column } };
}

/**
 * Inserts a table block. An empty paragraph at the caret is replaced; otherwise
 * the table goes after the current block. A paragraph is added after the table
 * when it would be the last block, so the caret can always continue below it.
 * Focus moves to the first cell.
 */
export function insertNgsHeadlessEditorTable(editor: NgsHeadlessEditor, table: NgsHeadlessEditorBlock): boolean {
  const blocks = editor.document().blocks;
  const focusId = editor.selection()?.focus.blockId ?? blocks[blocks.length - 1]?.id;
  const focusIndex = Math.max(0, blocks.findIndex(block => block.id === focusId));
  const focus = blocks[focusIndex];
  const replaceFocus = !!focus &&
    focus.type === 'paragraph' &&
    isNgsHeadlessEditorTextContent(focus.content) &&
    getNgsHeadlessEditorBlockText(focus).length === 0;
  const isLast = focusIndex === blocks.length - 1;
  const trailing = isLast ? [createNgsHeadlessEditorParagraph()] : [];

  const inserted = replaceFocus
    ? editor.replaceBlock(focus.id, [table, ...trailing])
    : editor.insertBlock([table, ...trailing]);
  if (inserted) {
    focusNgsHeadlessEditorTableCell(editor, { blockId: table.id, row: 0, column: 0 });
  }
  return inserted;
}

type TableChange = (table: ActiveTable) => { data: NgsHeadlessEditorTableData; row: number; column: number } | null;

function tableCommand(
  id: string,
  change: TableChange,
  enabled: (table: ActiveTable) => boolean = () => true
): NgsHeadlessEditorCommand {
  return {
    id,
    enabled: editor => {
      const table = activeTable(editor);
      return !!table && enabled(table);
    },
    execute: editor => {
      const table = activeTable(editor);
      const result = table ? change(table) : null;
      if (!table || !result) {
        return false;
      }
      const updated = editor.updateBlock(table.block.id, {
        attrs: { ...table.block.attrs, rows: result.data.rows, header: result.data.header }
      });
      if (updated) {
        focusNgsHeadlessEditorTableCell(editor, { blockId: table.block.id, row: result.row, column: result.column });
      }
      return updated;
    }
  };
}

/** Inserts a table. Payload: size and header row, default 3 × 3 with a header. */
export const NGS_HEADLESS_EDITOR_INSERT_TABLE: NgsHeadlessEditorCommand<NgsHeadlessEditorTableSize | undefined> = {
  id: 'insert-table',
  execute: (editor, size) => insertNgsHeadlessEditorTable(editor, createNgsHeadlessEditorTable(size ?? DEFAULT_SIZE))
};

export const NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_BEFORE = tableCommand('table-add-row-before', ({ data, cell }) => ({
  data: insertNgsHeadlessEditorTableRow(data, cell.row),
  row: cell.row,
  column: cell.column
}));

export const NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_AFTER = tableCommand('table-add-row-after', ({ data, cell }) => ({
  data: insertNgsHeadlessEditorTableRow(data, cell.row + 1),
  row: cell.row + 1,
  column: cell.column
}));

export const NGS_HEADLESS_EDITOR_TABLE_ADD_COLUMN_BEFORE = tableCommand('table-add-column-before', ({ data, cell }) => ({
  data: insertNgsHeadlessEditorTableColumn(data, cell.column),
  row: cell.row,
  column: cell.column
}));

export const NGS_HEADLESS_EDITOR_TABLE_ADD_COLUMN_AFTER = tableCommand('table-add-column-after', ({ data, cell }) => ({
  data: insertNgsHeadlessEditorTableColumn(data, cell.column + 1),
  row: cell.row,
  column: cell.column + 1
}));

export const NGS_HEADLESS_EDITOR_TABLE_DELETE_ROW = tableCommand(
  'table-delete-row',
  ({ data, cell }) => ({
    data: removeNgsHeadlessEditorTableRow(data, cell.row),
    row: Math.min(cell.row, data.rows.length - 2),
    column: cell.column
  }),
  ({ data }) => data.rows.length > 1
);

export const NGS_HEADLESS_EDITOR_TABLE_DELETE_COLUMN = tableCommand(
  'table-delete-column',
  ({ data, cell }) => ({
    data: removeNgsHeadlessEditorTableColumn(data, cell.column),
    row: cell.row,
    column: Math.min(cell.column, (data.rows[0]?.length ?? 1) - 2)
  }),
  ({ data }) => (data.rows[0]?.length ?? 0) > 1
);

export const NGS_HEADLESS_EDITOR_TABLE_TOGGLE_HEADER: NgsHeadlessEditorCommand = {
  ...tableCommand('table-toggle-header', ({ data, cell }) => ({
    data: { ...data, header: !data.header },
    row: cell.row,
    column: cell.column
  })),
  active: editor => activeTable(editor)?.data.header ?? false
};

export const NGS_HEADLESS_EDITOR_TABLE_DELETE: NgsHeadlessEditorCommand = {
  id: 'table-delete',
  enabled: editor => activeTable(editor) !== null,
  execute: editor => {
    const table = activeTable(editor);
    if (!table) {
      return false;
    }
    setNgsHeadlessEditorActiveTableCell(editor, null);
    return editor.removeBlock(table.block.id);
  }
};

/**
 * Adds a `table` block edited through an Angular component, commands for rows,
 * columns and the header row, and (optionally) pasting spreadsheet ranges and
 * HTML tables as tables. Cells hold rich text: every formatting command of the
 * editor works inside a focused cell unless `formatting` restricts it.
 */
export function tableEditorPlugin(options: NgsHeadlessEditorTablePluginOptions = {}): NgsHeadlessEditorPlugin {
  return defineNgsHeadlessEditorPlugin({
    id: 'table',
    blocks: [
      {
        type: NGS_HEADLESS_EDITOR_TABLE_TYPE,
        tagName: 'div',
        create: () => createNgsHeadlessEditorTable(DEFAULT_SIZE),
        isEmpty: () => false,
        editorComponent: NgsHeadlessEditorTableBlockEditor,
        rendererComponent: NgsHeadlessEditorTableView
      }
    ],
    commands: [
      NGS_HEADLESS_EDITOR_INSERT_TABLE,
      NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_BEFORE,
      NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_AFTER,
      NGS_HEADLESS_EDITOR_TABLE_ADD_COLUMN_BEFORE,
      NGS_HEADLESS_EDITOR_TABLE_ADD_COLUMN_AFTER,
      NGS_HEADLESS_EDITOR_TABLE_DELETE_ROW,
      NGS_HEADLESS_EDITOR_TABLE_DELETE_COLUMN,
      NGS_HEADLESS_EDITOR_TABLE_TOGGLE_HEADER,
      NGS_HEADLESS_EDITOR_TABLE_DELETE
    ] as NgsHeadlessEditorCommand<unknown>[],
    providers: [{ provide: NGS_HEADLESS_EDITOR_TABLE_OPTIONS, useValue: options }],
    handlePaste: options.paste === false
      ? undefined
      : (event, editor) => {
        // Cell formatting from the clipboard (bold, links, ...) is kept for the
        // marks that are allowed in cells.
        const marks = ngsHeadlessEditorTableCellMarks(editor, options.formatting);
        const rows = parseNgsHeadlessEditorTableHtml(event.clipboardData?.getData('text/html'), marks) ??
          parseNgsHeadlessEditorTableText(event.clipboardData?.getData('text/plain'));
        return rows ? insertNgsHeadlessEditorTable(editor, createNgsHeadlessEditorTable(rows, false)) : false;
      }
  });
}
