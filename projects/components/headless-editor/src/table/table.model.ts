import {
  createNgsHeadlessEditorId,
  createNgsHeadlessEditorText,
  isNgsHeadlessEditorTextContent,
  NgsHeadlessEditorBlock,
  NgsHeadlessEditorText,
  normalizeNgsHeadlessEditorTextContent
} from '../model';
import { NgsHeadlessEditorMarkRegistry, readNgsHeadlessEditorInlineContent } from '../render';

/** Block type used by the table plugin. */
export const NGS_HEADLESS_EDITOR_TABLE_TYPE = 'table';

/**
 * Content of one cell: text runs with marks, like a paragraph. Line breaks
 * inside a cell are newline characters.
 */
export type NgsHeadlessEditorTableCellContent = readonly NgsHeadlessEditorText[];

/** Cell input accepted by the helpers: plain text or text runs. */
export type NgsHeadlessEditorTableCellInput = string | NgsHeadlessEditorTableCellContent;

/** Serializable table data stored in `block.attrs`. */
export interface NgsHeadlessEditorTableData {
  /** Cell content by row, then column. Every row has the same number of cells. */
  readonly rows: readonly (readonly NgsHeadlessEditorTableCellContent[])[];
  /** Renders the first row as a header row. */
  readonly header: boolean;
}

export interface NgsHeadlessEditorTableSize {
  readonly rows: number;
  readonly columns: number;
  readonly header?: boolean;
}

/** Position of a cell inside a table block. */
export interface NgsHeadlessEditorTableCell {
  readonly blockId: string;
  readonly row: number;
  readonly column: number;
}

export type NgsHeadlessEditorTableBlock = NgsHeadlessEditorBlock<null>;

const MAX_ROWS = 500;
const MAX_COLUMNS = 50;

function clampCount(value: number, max: number): number {
  return Math.max(1, Math.min(max, Math.floor(Number.isFinite(value) ? value : 1)));
}

function emptyCell(): NgsHeadlessEditorTableCellContent {
  return [createNgsHeadlessEditorText()];
}

/** Normalizes one cell from plain text, text runs or untrusted JSON. */
export function normalizeNgsHeadlessEditorTableCell(cell: unknown): NgsHeadlessEditorTableCellContent {
  if (typeof cell === 'string') {
    return [createNgsHeadlessEditorText(cell)];
  }
  if (Array.isArray(cell)) {
    const runs = cell
      .filter((run): run is NgsHeadlessEditorText => (
        typeof run === 'object' && run !== null && typeof (run as NgsHeadlessEditorText).text === 'string'
      ))
      .map(run => createNgsHeadlessEditorText(run.text, Array.isArray(run.marks) ? run.marks : []));
    return isNgsHeadlessEditorTextContent(runs) && runs.length > 0
      ? normalizeNgsHeadlessEditorTextContent(runs)
      : emptyCell();
  }
  return cell === null || cell === undefined ? emptyCell() : [createNgsHeadlessEditorText(String(cell))];
}

/** Makes the rows rectangular, normalizes every cell and keeps at least one cell. */
export function normalizeNgsHeadlessEditorTableRows(rows: unknown): NgsHeadlessEditorTableCellContent[][] {
  const source = Array.isArray(rows) ? rows : [];
  const normalized = source
    .slice(0, MAX_ROWS)
    .map(row => (Array.isArray(row) ? row : []).slice(0, MAX_COLUMNS).map(normalizeNgsHeadlessEditorTableCell));
  const columns = Math.max(1, ...normalized.map(row => row.length));
  const result = normalized.map(row => [...row, ...Array.from({ length: columns - row.length }, emptyCell)]);
  return result.length > 0 ? result : [Array.from({ length: columns }, emptyCell)];
}

/** Plain text of a cell. */
export function getNgsHeadlessEditorTableCellText(cell: NgsHeadlessEditorTableCellContent): string {
  return cell.map(run => run.text).join('');
}

/** Reads and normalizes the table data of a block. */
export function getNgsHeadlessEditorTableData(block: NgsHeadlessEditorBlock): NgsHeadlessEditorTableData {
  return {
    rows: normalizeNgsHeadlessEditorTableRows(block.attrs?.['rows']),
    header: block.attrs?.['header'] === true
  };
}

/** Creates a table block from cell text or from a size. */
export function createNgsHeadlessEditorTable(
  source: NgsHeadlessEditorTableSize | readonly (readonly NgsHeadlessEditorTableCellInput[])[],
  header = true
): NgsHeadlessEditorTableBlock {
  const rows = Array.isArray(source)
    ? normalizeNgsHeadlessEditorTableRows(source)
    : Array.from(
      { length: clampCount((source as NgsHeadlessEditorTableSize).rows, MAX_ROWS) },
      () => Array.from({ length: clampCount((source as NgsHeadlessEditorTableSize).columns, MAX_COLUMNS) }, emptyCell)
    );
  const withHeader = Array.isArray(source) ? header : (source as NgsHeadlessEditorTableSize).header ?? header;
  return {
    id: createNgsHeadlessEditorId(NGS_HEADLESS_EDITOR_TABLE_TYPE),
    type: NGS_HEADLESS_EDITOR_TABLE_TYPE,
    content: null,
    attrs: { rows, header: withHeader }
  };
}

export function isNgsHeadlessEditorTable(block: NgsHeadlessEditorBlock | undefined): boolean {
  return block?.type === NGS_HEADLESS_EDITOR_TABLE_TYPE;
}

// ---------------------------------------------------------------------------
// Pure table operations. Each returns new data and never mutates the input.
// ---------------------------------------------------------------------------

export function setNgsHeadlessEditorTableCell(
  data: NgsHeadlessEditorTableData,
  row: number,
  column: number,
  content: NgsHeadlessEditorTableCellInput
): NgsHeadlessEditorTableData {
  const next = normalizeNgsHeadlessEditorTableCell(content);
  return {
    ...data,
    rows: data.rows.map((cells, rowIndex) => rowIndex !== row
      ? cells
      : cells.map((cell, columnIndex) => columnIndex === column ? next : cell))
  };
}

export function insertNgsHeadlessEditorTableRow(
  data: NgsHeadlessEditorTableData,
  index: number
): NgsHeadlessEditorTableData {
  const columns = data.rows[0]?.length ?? 1;
  const rows = [...data.rows];
  rows.splice(Math.max(0, Math.min(index, rows.length)), 0, Array.from({ length: columns }, emptyCell));
  return { ...data, rows };
}

export function removeNgsHeadlessEditorTableRow(
  data: NgsHeadlessEditorTableData,
  index: number
): NgsHeadlessEditorTableData {
  if (data.rows.length <= 1) {
    return data;
  }
  return { ...data, rows: data.rows.filter((_, rowIndex) => rowIndex !== index) };
}

export function insertNgsHeadlessEditorTableColumn(
  data: NgsHeadlessEditorTableData,
  index: number
): NgsHeadlessEditorTableData {
  return {
    ...data,
    rows: data.rows.map(cells => {
      const next = [...cells];
      next.splice(Math.max(0, Math.min(index, next.length)), 0, emptyCell());
      return next;
    })
  };
}

export function removeNgsHeadlessEditorTableColumn(
  data: NgsHeadlessEditorTableData,
  index: number
): NgsHeadlessEditorTableData {
  if ((data.rows[0]?.length ?? 0) <= 1) {
    return data;
  }
  return { ...data, rows: data.rows.map(cells => cells.filter((_, columnIndex) => columnIndex !== index)) };
}

// ---------------------------------------------------------------------------
// Clipboard parsing
// ---------------------------------------------------------------------------

/**
 * Parses tab-separated text as copied from Excel, Google Sheets or Numbers.
 * Returns null unless the text has at least two cells. Quoted cells with tabs,
 * newlines and doubled quotes are supported.
 */
export function parseNgsHeadlessEditorTableText(
  text: string | null | undefined
): NgsHeadlessEditorTableCellContent[][] | null {
  const source = (text ?? '').replace(/\r\n?/g, '\n').replace(/\n$/, '');
  if (!source.includes('\t')) {
    return null;
  }
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell.length === 0) {
      quoted = true;
    } else if (char === '\t') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);

  // Only a real grid counts: the same number of cells (at least two) in every
  // row and some row with two filled cells. This keeps tab-indented code and
  // prose with a stray tab from turning into tables.
  const columns = rows[0].length;
  const isGrid = columns >= 2 &&
    rows.every(cells => cells.length === columns) &&
    rows.some(cells => cells.filter(value => value.trim().length > 0).length >= 2);
  return isGrid ? normalizeNgsHeadlessEditorTableRows(rows) : null;
}

/**
 * Extracts the table from clipboard HTML (text content only; markup and
 * attributes are discarded). Returns null when the clipboard also contains text
 * outside the table, so copying an article that happens to include a table is
 * pasted as text, and on the server where there is no DOMParser.
 */
export function parseNgsHeadlessEditorTableHtml(
  html: string | null | undefined,
  marks?: NgsHeadlessEditorMarkRegistry
): NgsHeadlessEditorTableCellContent[][] | null {
  if (!html || !/<table[\s>]/i.test(html) || typeof DOMParser === 'undefined') {
    return null;
  }
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const table = parsed.querySelector('table');
  if (!table) {
    return null;
  }
  const outside = (parsed.body.textContent ?? '').replace(table.textContent ?? '', '').trim();
  if (outside.length > 0) {
    return null;
  }
  const registry: NgsHeadlessEditorMarkRegistry = marks ?? { getMarkDefinition: () => undefined, getMarkDefinitions: () => [] };
  const rows = [...table.querySelectorAll('tr')].map(row => [...row.querySelectorAll('th, td')].map(cell => (
    trimRuns(readNgsHeadlessEditorInlineContent(cell, registry, { lineBreaks: true })
      .map(run => createNgsHeadlessEditorText(run.text.replace(/\u00a0/g, ' '), run.marks)))
  )));
  const filtered = rows.filter(row => row.length > 0);
  return filtered.length > 0 ? normalizeNgsHeadlessEditorTableRows(filtered) : null;
}

/** Trims whitespace at both ends of a cell while keeping marks. */
function trimRuns(runs: readonly NgsHeadlessEditorText[]): NgsHeadlessEditorTableCellContent {
  const result = runs.map(run => ({ ...run }));
  while (result.length > 0 && result[0].text.trim() === '') {
    result.shift();
  }
  while (result.length > 0 && result[result.length - 1].text.trim() === '') {
    result.pop();
  }
  if (result.length === 0) {
    return emptyCell();
  }
  result[0] = { ...result[0], text: result[0].text.replace(/^\s+/, '') };
  const last = result.length - 1;
  result[last] = { ...result[last], text: result[last].text.replace(/\s+$/, '') };
  return normalizeNgsHeadlessEditorTextContent(result);
}
