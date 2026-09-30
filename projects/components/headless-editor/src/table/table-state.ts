import { signal, Signal, WritableSignal } from '@angular/core';
import type { NgsHeadlessEditor } from '../headless-editor';
import { NgsHeadlessEditorTableCell } from './table.model';

interface TableState {
  readonly cell: WritableSignal<NgsHeadlessEditorTableCell | null>;
  /** Cell that the table component should focus after it renders. */
  readonly pendingFocus: WritableSignal<NgsHeadlessEditorTableCell | null>;
}

const states = new WeakMap<NgsHeadlessEditor, TableState>();

function state(editor: NgsHeadlessEditor): TableState {
  let current = states.get(editor);
  if (!current) {
    current = { cell: signal(null), pendingFocus: signal(null) };
    states.set(editor, current);
  }
  return current;
}

/**
 * The table cell that currently has focus, or the last focused one while focus
 * is on a toolbar control. Table commands operate on this cell.
 */
export function ngsHeadlessEditorActiveTableCell(editor: NgsHeadlessEditor): Signal<NgsHeadlessEditorTableCell | null> {
  return state(editor).cell.asReadonly();
}

/** @internal Used by the table component. */
export function setNgsHeadlessEditorActiveTableCell(
  editor: NgsHeadlessEditor,
  cell: NgsHeadlessEditorTableCell | null
): void {
  state(editor).cell.set(cell);
}

/** Moves focus to a table cell once its table is rendered. */
export function focusNgsHeadlessEditorTableCell(editor: NgsHeadlessEditor, cell: NgsHeadlessEditorTableCell): void {
  state(editor).cell.set(cell);
  state(editor).pendingFocus.set(cell);
}

/** @internal Used by the table component. */
export function pendingNgsHeadlessEditorTableFocus(editor: NgsHeadlessEditor): WritableSignal<NgsHeadlessEditorTableCell | null> {
  return state(editor).pendingFocus;
}
