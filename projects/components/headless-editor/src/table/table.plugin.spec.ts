import { Component, inject, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { basicTextEditorPlugin, NGS_HEADLESS_EDITOR_TOGGLE_BOLD } from '../basic-text.plugin';
import { NgsHeadlessEditor, provideNgsHeadlessEditor } from '../headless-editor';
import { NgsHeadlessEditorSurface } from '../headless-editor-surface.directive';
import { createNgsHeadlessEditorDocument, createNgsHeadlessEditorParagraph, getNgsHeadlessEditorDocumentText } from '../model';
import { withHeadlessEditorPlugin } from '../plugin';
import { ngsHeadlessEditorActiveTableCell } from './table-state';
import {
  NGS_HEADLESS_EDITOR_INSERT_TABLE,
  NGS_HEADLESS_EDITOR_TABLE_ADD_COLUMN_AFTER,
  NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_AFTER,
  NGS_HEADLESS_EDITOR_TABLE_DELETE,
  NGS_HEADLESS_EDITOR_TABLE_DELETE_ROW,
  NGS_HEADLESS_EDITOR_TABLE_TOGGLE_HEADER,
  tableEditorPlugin
} from './table.plugin';
import { getNgsHeadlessEditorTableCellText, getNgsHeadlessEditorTableData } from './table.model';

@Component({
  imports: [NgsHeadlessEditorSurface],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(tableEditorPlugin())
    )
  ],
  template: '<div ngsHeadlessEditorSurface></div>'
})
class TableHost {
  readonly editor = inject(NgsHeadlessEditor);
}

@Component({
  imports: [NgsHeadlessEditorSurface],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(tableEditorPlugin({ formatting: false }))
    )
  ],
  template: '<div ngsHeadlessEditorSurface></div>'
})
class PlainTableHost {
  readonly editor = inject(NgsHeadlessEditor);
}

describe('tableEditorPlugin', () => {
  let fixture: ComponentFixture<{ editor: NgsHeadlessEditor }>;
  let editor: NgsHeadlessEditor;

  const settle = async () => {
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
    await fixture.whenStable();
  };
  const table = () => editor.document().blocks.find(block => block.type === 'table')!;
  const cells = () => getNgsHeadlessEditorTableData(table()).rows;
  const rows = () => cells().map(row => row.map(getNgsHeadlessEditorTableCellText));
  const cell = (row: number, column: number) =>
    fixture.nativeElement.querySelector(`[data-row="${row}"][data-column="${column}"]`) as HTMLElement;
  const editingCell = () => fixture.nativeElement.querySelector('.ngs-headless-editor-table-cell-editor') as HTMLElement | null;
  const focusIsIn = (element: HTMLElement) => element.contains(document.activeElement);

  async function create(host: Type<{ editor: NgsHeadlessEditor }> = TableHost): Promise<void> {
    await TestBed.configureTestingModule({ imports: [host] }).compileComponents();
    fixture = TestBed.createComponent(host);
    fixture.autoDetectChanges();
    editor = fixture.componentInstance.editor;
    await settle();
  }

  afterEach(() => TestBed.resetTestingModule());

  it('replaces an empty line with a table, adds a paragraph below and edits the first cell', async () => {
    await create();
    expect(editor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE, { rows: 2, columns: 2, header: true })).toBe(true);
    await settle();

    expect(editor.document().blocks.map(block => block.type)).toEqual(['table', 'paragraph']);
    expect(fixture.nativeElement.querySelectorAll('th')).toHaveLength(2);
    expect(focusIsIn(cell(0, 0))).toBe(true);
    expect(cell(0, 0).contains(editingCell())).toBe(true);
    expect(ngsHeadlessEditorActiveTableCell(editor)()).toEqual({ blockId: table().id, row: 0, column: 0 });
  });

  it('inserts after a non-empty block and keeps the text', async () => {
    await create();
    editor.setDocument({ version: 1, blocks: [createNgsHeadlessEditorParagraph('Intro'), createNgsHeadlessEditorParagraph('End')] });
    editor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE);
    await settle();

    expect(editor.document().blocks.map(block => block.type)).toEqual(['paragraph', 'table', 'paragraph']);
    expect(rows()).toEqual([['', '', ''], ['', '', ''], ['', '', '']]);
  });

  it('types into cells, moves with Tab, appends a row and undoes in the document history', async () => {
    await create();
    editor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE, { rows: 1, columns: 2, header: false });
    await settle();

    await userEvent.keyboard('Plan{Tab}Price');
    await settle();
    expect(rows()).toEqual([['Plan', 'Price']]);

    await userEvent.keyboard('{Tab}');
    await settle();
    expect(rows()).toEqual([['Plan', 'Price'], ['', '']]);
    expect(focusIsIn(cell(1, 0))).toBe(true);

    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await settle();
    expect(focusIsIn(cell(0, 1))).toBe(true);

    await userEvent.keyboard('{Control>}z{/Control}'); // removes the appended row
    await userEvent.keyboard('{Control>}z{/Control}'); // removes "Price" as one step
    await settle();
    expect(rows()).toEqual([['Plan', '']]);
    expect(cell(0, 1).textContent).toBe('');
  });

  it('keeps line breaks inside a cell', async () => {
    await create();
    editor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE, { rows: 1, columns: 1, header: false });
    await settle();
    await userEvent.keyboard('First{Enter}Second');
    await settle();

    expect(rows()).toEqual([['First\nSecond']]);
  });

  it('applies toolbar and keyboard formatting to the focused cell only', async () => {
    await create();
    editor.setDocument({ version: 1, blocks: [createNgsHeadlessEditorParagraph('Outside')] });
    editor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE, { rows: 1, columns: 2, header: false });
    await settle();

    expect(editor.canEditBlocks()).toBe(false);
    expect(editor.inlineTarget()).not.toBeNull();

    // Toolbar path: the command runs on the document editor and acts on the cell.
    expect(editor.isCommandEnabled(NGS_HEADLESS_EDITOR_TOGGLE_BOLD)).toBe(true);
    editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);
    expect(editor.isMarkActive('bold')).toBe(true);
    await userEvent.keyboard('Bold');
    await settle();
    expect(cells()[0][0]).toEqual([{ type: 'text', text: 'Bold', marks: [{ type: 'bold', attrs: undefined }] }]);

    // Keyboard path inside the next cell.
    await userEvent.keyboard('{Tab}plain {Control>}b{/Control}strong');
    await settle();
    expect(cells()[0][1].map(run => [run.text, run.marks.map(mark => mark.type)])).toEqual([
      ['plain ', []],
      ['strong', ['bold']]
    ]);
    expect(cell(0, 1).querySelector('strong')?.textContent).toBe('strong');

    // The document text is untouched.
    expect(getNgsHeadlessEditorDocumentText({ version: 1, blocks: [editor.document().blocks[0]] })).toBe('Outside');
    expect(editor.document().blocks[0].content).toEqual([{ type: 'text', text: 'Outside', marks: [] }]);
  });

  it('stops editing when the document text gets focus', async () => {
    await create();
    editor.setDocument(createNgsHeadlessEditorDocument('Text'));
    editor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE);
    await settle();
    expect(editor.inlineTarget()).not.toBeNull();

    await userEvent.click(fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface] > p'));
    await settle();

    expect(editingCell()).toBeNull();
    expect(editor.inlineTarget()).toBeNull();
    expect(ngsHeadlessEditorActiveTableCell(editor)()).toBeNull();
    expect(editor.canEditBlocks()).toBe(true);
    expect(editor.isCommandEnabled(NGS_HEADLESS_EDITOR_TABLE_DELETE_ROW)).toBe(false);
  });

  it('opens a cell on click and keeps it open while a toolbar button is used', async () => {
    await create();
    editor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE, { rows: 2, columns: 2, header: false });
    await settle();
    await userEvent.click(cell(1, 1).querySelector('.ngs-headless-editor-table-cell-content')!);
    await settle();

    expect(cell(1, 1).contains(editingCell())).toBe(true);
    expect(ngsHeadlessEditorActiveTableCell(editor)()).toEqual({ blockId: table().id, row: 1, column: 1 });
  });

  it('runs row, column and header commands on the focused cell', async () => {
    await create();
    editor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE, { rows: 2, columns: 2, header: true });
    await settle();
    expect(editor.isCommandEnabled(NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_AFTER)).toBe(true);

    editor.execute(NGS_HEADLESS_EDITOR_TABLE_ADD_ROW_AFTER);
    await settle();
    editor.execute(NGS_HEADLESS_EDITOR_TABLE_ADD_COLUMN_AFTER);
    await settle();
    expect(rows().length).toBe(3);
    expect(rows()[0].length).toBe(3);
    expect(ngsHeadlessEditorActiveTableCell(editor)()).toEqual({ blockId: table().id, row: 1, column: 1 });
    expect(focusIsIn(cell(1, 1))).toBe(true);

    expect(editor.isCommandActive(NGS_HEADLESS_EDITOR_TABLE_TOGGLE_HEADER)).toBe(true);
    editor.execute(NGS_HEADLESS_EDITOR_TABLE_TOGGLE_HEADER);
    editor.execute(NGS_HEADLESS_EDITOR_TABLE_DELETE_ROW);
    await settle();
    expect(getNgsHeadlessEditorTableData(table()).header).toBe(false);
    expect(rows().length).toBe(2);

    editor.execute(NGS_HEADLESS_EDITOR_TABLE_DELETE);
    await settle();
    expect(editor.document().blocks.some(block => block.type === 'table')).toBe(false);
    expect(editor.inlineTarget()).toBeNull();
  });

  it('pastes spreadsheet ranges as a table', async () => {
    await create();
    editor.setDocument(createNgsHeadlessEditorDocument(''));
    await settle();
    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/html', '<table><tr><td><b>Name</b></td><td>Price</td></tr><tr><td>Pro</td><td>$20</td></tr></table>');
    clipboardData.setData('text/plain', 'Name\tPrice\nPro\t$20');
    surface.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData }));
    await settle();

    expect(rows()).toEqual([['Name', 'Price'], ['Pro', '$20']]);
    expect(cells()[0][0][0].marks).toEqual([{ type: 'bold', attrs: undefined }]);
    expect(getNgsHeadlessEditorTableData(table()).header).toBe(false);
  });

  it('renders the read-only view with formatting', async () => {
    await create();
    editor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE, { rows: 2, columns: 1, header: true });
    await settle();
    await userEvent.keyboard('{Control>}b{/Control}Title');
    await settle();
    editor.setReadOnly(true);
    await settle();

    expect(editingCell()).toBeNull();
    expect(fixture.nativeElement.querySelector('thead th strong')?.textContent).toBe('Title');
  });

  it('keeps cells plain text when formatting is disabled', async () => {
    await create(PlainTableHost);
    editor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE, { rows: 1, columns: 1, header: false });
    await settle();

    expect(editor.canApplyMark('bold')).toBe(false);
    expect(editor.isCommandEnabled(NGS_HEADLESS_EDITOR_TOGGLE_BOLD)).toBe(false);
    await userEvent.keyboard('{Control>}b{/Control}text');
    await settle();
    expect(cells()[0][0]).toEqual([{ type: 'text', text: 'text', marks: [] }]);
  });
});
