import {
  createNgsHeadlessEditorTable,
  getNgsHeadlessEditorTableCellText,
  NgsHeadlessEditorTableCellContent,
  getNgsHeadlessEditorTableData,
  insertNgsHeadlessEditorTableColumn,
  insertNgsHeadlessEditorTableRow,
  normalizeNgsHeadlessEditorTableRows,
  parseNgsHeadlessEditorTableHtml,
  parseNgsHeadlessEditorTableText,
  removeNgsHeadlessEditorTableColumn,
  removeNgsHeadlessEditorTableRow,
  setNgsHeadlessEditorTableCell
} from './table.model';

const text = (rows: readonly (readonly NgsHeadlessEditorTableCellContent[])[] | null) =>
  rows?.map(row => row.map(getNgsHeadlessEditorTableCellText)) ?? null;

describe('table model', () => {
  it('creates tables from a size or from cell text', () => {
    const empty = getNgsHeadlessEditorTableData(createNgsHeadlessEditorTable({ rows: 2, columns: 3 }));
    expect(text(empty.rows)).toEqual([['', '', ''], ['', '', '']]);
    expect(empty.header).toBe(true);

    const filled = getNgsHeadlessEditorTableData(createNgsHeadlessEditorTable([['a', 'b'], ['c']], false));
    expect(text(filled.rows)).toEqual([['a', 'b'], ['c', '']]);
    expect(filled.header).toBe(false);
  });

  it('normalizes untrusted attrs into a rectangular grid', () => {
    expect(text(normalizeNgsHeadlessEditorTableRows(null))).toEqual([['']]);
    expect(text(normalizeNgsHeadlessEditorTableRows([['a', 1, null], 'x']))).toEqual([['a', '1', ''], ['', '', '']]);
    expect(normalizeNgsHeadlessEditorTableRows([[[{ type: 'text', text: 'B', marks: [{ type: 'bold' }] }, { text: 5 }]]])[0][0])
      .toEqual([{ type: 'text', text: 'B', marks: [{ type: 'bold', attrs: undefined }] }]);
  });

  it('edits rows, columns and cells without mutating the input', () => {
    const data = getNgsHeadlessEditorTableData(createNgsHeadlessEditorTable([['a', 'b'], ['c', 'd']], false));
    const frozen = JSON.stringify(data);

    expect(text(setNgsHeadlessEditorTableCell(data, 1, 0, 'x').rows)).toEqual([['a', 'b'], ['x', 'd']]);
    expect(text(insertNgsHeadlessEditorTableRow(data, 1).rows)).toEqual([['a', 'b'], ['', ''], ['c', 'd']]);
    expect(text(insertNgsHeadlessEditorTableColumn(data, 2).rows)).toEqual([['a', 'b', ''], ['c', 'd', '']]);
    expect(text(removeNgsHeadlessEditorTableRow(data, 0).rows)).toEqual([['c', 'd']]);
    expect(text(removeNgsHeadlessEditorTableColumn(data, 1).rows)).toEqual([['a'], ['c']]);
    const single = getNgsHeadlessEditorTableData(createNgsHeadlessEditorTable([['only']]));
    expect(text(removeNgsHeadlessEditorTableColumn(single, 0).rows)).toEqual([['only']]);
    expect(JSON.stringify(data)).toBe(frozen);
  });

  it('parses spreadsheet ranges but not tab-indented text', () => {
    expect(text(parseNgsHeadlessEditorTableText('Name\tPrice\nPro\t$20\n'))).toEqual([['Name', 'Price'], ['Pro', '$20']]);
    expect(text(parseNgsHeadlessEditorTableText('"Multi\nline"\t"say ""hi"""'))).toEqual([['Multi\nline', 'say "hi"']]);
    expect(parseNgsHeadlessEditorTableText('\tindented code\n\t\tmore')).toBeNull();
    expect(parseNgsHeadlessEditorTableText('plain text')).toBeNull();
  });

  it('keeps allowed formatting from HTML tables', () => {
    const marks = {
      getMarkDefinition: (type: string) => type === 'bold' ? { type: 'bold', tagName: 'strong', parseTags: ['b'] } : undefined,
      getMarkDefinitions: () => [{ type: 'bold', tagName: 'strong', parseTags: ['b'] }]
    };
    const rows = parseNgsHeadlessEditorTableHtml('<table><tr><td>a <b>bold</b> <i>it</i></td></tr></table>', marks)!;
    expect(rows[0][0]).toEqual([
      { type: 'text', text: 'a ', marks: [] },
      { type: 'text', text: 'bold', marks: [{ type: 'bold', attrs: undefined }] },
      { type: 'text', text: ' it', marks: [] }
    ]);
  });

  it('parses HTML tables only when the clipboard holds just the table', () => {
    const table = '<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>&nbsp;2 </td></tr></table>';
    expect(text(parseNgsHeadlessEditorTableHtml(`<meta charset="utf-8">${table}`))).toEqual([['A', 'B'], ['1', '2']]);
    expect(parseNgsHeadlessEditorTableHtml(`<p>Intro paragraph</p>${table}`)).toBeNull();
    expect(parseNgsHeadlessEditorTableHtml('<p>No table</p>')).toBeNull();
  });
});
