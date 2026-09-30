import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import {
  NgsHeadlessEditorInlineRegion,
  provideNgsHeadlessEditorInlineRegion
} from '../../headless-editor-inline-region';
import { NgsHeadlessEditorRuns } from '../../headless-editor-runs.directive';
import { NgsHeadlessEditorSurface } from '../../headless-editor-surface.directive';
import {
  getNgsHeadlessEditorBlockText,
  NgsHeadlessEditorBlock,
  ngsHeadlessEditorValuesEqual,
  NgsHeadlessEditorText
} from '../../model';
import { NgsHeadlessEditorBlockComponent } from '../../plugin';
import {
  focusNgsHeadlessEditorTableCell,
  ngsHeadlessEditorActiveTableCell,
  pendingNgsHeadlessEditorTableFocus,
  setNgsHeadlessEditorActiveTableCell
} from '../table-state';
import {
  getNgsHeadlessEditorTableData,
  insertNgsHeadlessEditorTableRow,
  normalizeNgsHeadlessEditorTableCell,
  NgsHeadlessEditorTableData,
  setNgsHeadlessEditorTableCell
} from '../table.model';
import { NGS_HEADLESS_EDITOR_TABLE_OPTIONS } from '../table.options';

interface CellPosition {
  readonly row: number;
  readonly column: number;
}

type CaretPositionDocument = Document & {
  caretPositionFromPoint?(x: number, y: number): { offsetNode: Node; offset: number } | null;
  caretRangeFromPoint?(x: number, y: number): Range | null;
};

/**
 * Editing component for table blocks.
 *
 * Cells are rendered as static rich text. The focused cell is edited by one
 * nested editor (NgsHeadlessEditorInlineRegion) that reuses the marks, commands
 * and shortcuts of the document editor and becomes its inline target, so the
 * regular toolbar formats the cell. Changes are written back with updateBlock()
 * and recorded in the document history, grouped per cell.
 *
 * Styling hooks: `ngs-headless-editor-table`, `ngs-headless-editor-table-cell`
 * (th for header cells), `active` on the focused cell,
 * `ngs-headless-editor-table-cell-content` and `ngs-headless-editor-table-cell-editor`.
 */
@Component({
  selector: 'ngs-headless-editor-table-editor',
  imports: [NgTemplateOutlet, NgsHeadlessEditorRuns, NgsHeadlessEditorSurface],
  providers: [provideNgsHeadlessEditorInlineRegion()],
  templateUrl: './table-block.html',
  styleUrl: './table-block.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgsHeadlessEditorTableBlockEditor implements NgsHeadlessEditorBlockComponent<null> {
  private readonly region = inject(NgsHeadlessEditorInlineRegion);
  private readonly editor = this.region.parent;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly documentRef = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly options = inject(NGS_HEADLESS_EDITOR_TABLE_OPTIONS);
  private readonly activeCell = ngsHeadlessEditorActiveTableCell(this.editor);
  private readonly pendingFocus = pendingNgsHeadlessEditorTableFocus(this.editor);
  private readonly surface = viewChild(NgsHeadlessEditorSurface);

  readonly block = input.required<NgsHeadlessEditorBlock<null>>();
  readonly data = computed<NgsHeadlessEditorTableData>(() => getNgsHeadlessEditorTableData(this.block()));
  /** Cell edited by the nested editor, if any. */
  readonly editing = signal<CellPosition | null>(null);
  /** Set while focus returns to a static cell after Escape, so it is not edited again. */
  private skipFocusEdit = false;

  constructor() {
    this.region.configure({ marks: this.options.formatting ?? true });

    // Nested editor -> table block.
    effect(() => {
      this.region.editor.document();
      const origin = this.region.editor.origin();
      untracked(() => {
        const editing = this.editing();
        if (!editing || origin === 'external') {
          return;
        }
        const typing = origin === 'keyboard' || origin === 'composition';
        this.writeCell(editing.row, editing.column, this.region.content(), typing);
      });
    });

    // Table block (undo, redo, commands) -> nested editor.
    effect(() => {
      const data = this.data();
      const editing = this.editing();
      if (!editing) {
        return;
      }
      const cell = data.rows[editing.row]?.[editing.column];
      untracked(() => cell ? this.region.load(cell) : this.stopEditing());
    });

    // Leave the cell when the document text gets focus or another nested editor
    // takes over. Only a change to "focused" counts: a cell can be opened with a
    // click while the document text still has focus.
    let documentWasFocused = this.editor.focused();
    effect(() => {
      const documentFocused = this.editor.focused();
      const target = this.editor.inlineTarget();
      untracked(() => {
        const focusMovedToDocument = documentFocused && !documentWasFocused;
        documentWasFocused = documentFocused;
        if (this.editing() && (focusMovedToDocument || target !== this.region.editor)) {
          this.stopEditing();
        }
      });
    });

    // Focus requests from commands (insert table, add row, ...).
    effect(() => {
      const pending = this.pendingFocus();
      if (pending && pending.blockId === this.block().id) {
        afterNextRender(() => {
          if (this.pendingFocus() === pending) {
            this.pendingFocus.set(null);
            this.edit(pending.row, pending.column);
          }
        }, { injector: this.injector });
      }
    });
  }

  isActive(row: number, column: number): boolean {
    const cell = this.activeCell();
    return !!cell && cell.blockId === this.block().id && cell.row === row && cell.column === column;
  }

  isEditing(row: number, column: number): boolean {
    const editing = this.editing();
    return !!editing && editing.row === row && editing.column === column;
  }

  onContentPointerDown(event: PointerEvent, row: number, column: number): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    this.edit(row, column, { x: event.clientX, y: event.clientY });
  }

  onContentFocus(row: number, column: number): void {
    if (this.skipFocusEdit) {
      this.skipFocusEdit = false;
      return;
    }
    if (!this.isEditing(row, column)) {
      this.edit(row, column);
    }
  }

  onKeydown(event: KeyboardEvent, row: number, column: number): void {
    if (event.key === 'Escape' && this.isEditing(row, column)) {
      event.preventDefault();
      this.stopEditing();
      afterNextRender(() => {
        this.skipFocusEdit = true;
        this.cellContent(row, column)?.focus();
        this.skipFocusEdit = false;
      }, { injector: this.injector });
      return;
    }
    if (event.key !== 'Tab' || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    event.preventDefault();
    const { rows } = this.data();
    const columns = rows[0]?.length ?? 1;
    const index = row * columns + column + (event.shiftKey ? -1 : 1);
    if (index < 0) {
      return;
    }
    if (index >= rows.length * columns) {
      // Tab in the last cell appends a row, like spreadsheets and word processors.
      if (this.writeData(insertNgsHeadlessEditorTableRow(this.data(), rows.length))) {
        focusNgsHeadlessEditorTableCell(this.editor, { blockId: this.block().id, row: rows.length, column: 0 });
      }
      return;
    }
    this.edit(Math.floor(index / columns), index % columns);
  }

  /** Starts editing a cell, with the caret at a point or at the end of the cell. */
  edit(row: number, column: number, point?: { x: number; y: number }): void {
    const cell = this.data().rows[row]?.[column];
    if (!cell || this.editor.readOnly()) {
      return;
    }
    this.editing.set({ row, column });
    this.region.load(cell);
    this.region.activate();
    setNgsHeadlessEditorActiveTableCell(this.editor, { blockId: this.block().id, row, column });
    afterNextRender(() => this.focusEditor(point), { injector: this.injector });
  }

  private stopEditing(): void {
    const editing = this.editing();
    this.editing.set(null);
    this.region.deactivate();
    const active = this.activeCell();
    if (editing && active?.blockId === this.block().id) {
      setNgsHeadlessEditorActiveTableCell(this.editor, null);
    }
  }

  private focusEditor(point?: { x: number; y: number }): void {
    const surface = this.surface();
    const element = this.host.querySelector<HTMLElement>('.ngs-headless-editor-table-cell-editor');
    if (!surface || !element) {
      return;
    }
    if (point) {
      surface.focus();
      const range = this.rangeFromPoint(point.x, point.y);
      if (range && element.contains(range.startContainer)) {
        const selection = this.documentRef.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        return;
      }
    }
    const blocks = this.region.editor.document().blocks;
    const last = blocks[blocks.length - 1];
    const offset = getNgsHeadlessEditorBlockText(last).length;
    this.region.editor.setSelection({
      anchor: { blockId: last.id, offset },
      focus: { blockId: last.id, offset }
    });
    surface.focus();
  }

  private rangeFromPoint(x: number, y: number): Range | null {
    const document = this.documentRef as CaretPositionDocument;
    if (typeof document.caretPositionFromPoint === 'function') {
      const position = document.caretPositionFromPoint(x, y);
      if (!position) {
        return null;
      }
      const range = document.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.collapse(true);
      return range;
    }
    return typeof document.caretRangeFromPoint === 'function' ? document.caretRangeFromPoint(x, y) : null;
  }

  private cellContent(row: number, column: number): HTMLElement | null {
    return this.host.querySelector<HTMLElement>(
      `[data-row="${row}"][data-column="${column}"] .ngs-headless-editor-table-cell-content`
    );
  }

  private writeCell(row: number, column: number, content: readonly NgsHeadlessEditorText[], typing: boolean): void {
    const data = this.data();
    const current = data.rows[row]?.[column];
    if (!current || ngsHeadlessEditorValuesEqual(current, normalizeNgsHeadlessEditorTableCell(content))) {
      return;
    }
    this.writeData(
      setNgsHeadlessEditorTableCell(data, row, column, content),
      typing ? `table-cell:${this.block().id}:${row}:${column}` : null
    );
  }

  private writeData(data: NgsHeadlessEditorTableData, historyGroup: string | null = null): boolean {
    return this.editor.updateBlock(
      this.block().id,
      { attrs: { ...this.block().attrs, rows: data.rows, header: data.header } },
      'keyboard',
      historyGroup
    );
  }
}
