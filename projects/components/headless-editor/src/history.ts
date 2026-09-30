import { computed, Injectable, signal } from '@angular/core';
import { NgsHeadlessEditorDocument, NgsHeadlessEditorSelection } from './model';

/**
 * Documents and selections are immutable, so snapshots share structure with the
 * live document instead of deep-copying it on every change.
 */
export interface NgsHeadlessEditorSnapshot {
  readonly document: NgsHeadlessEditorDocument;
  readonly selection: NgsHeadlessEditorSelection | null;
}

/** Maximum number of undo steps kept in memory. */
export const NGS_HEADLESS_EDITOR_HISTORY_LIMIT = 200;
/** Consecutive changes of the same group within this window form one undo step. */
export const NGS_HEADLESS_EDITOR_HISTORY_GROUP_DELAY = 1000;

@Injectable()
export class NgsHeadlessEditorHistory {
  private readonly _past = signal<readonly NgsHeadlessEditorSnapshot[]>([]);
  private readonly _future = signal<readonly NgsHeadlessEditorSnapshot[]>([]);
  private lastGroup: string | null = null;
  private lastRecordedAt = 0;

  readonly canUndo = computed(() => this._past().length > 0);
  readonly canRedo = computed(() => this._future().length > 0);

  /**
   * Records the state before a change. Changes that share a non-null `group`
   * (for example consecutive typed characters) and follow each other quickly
   * are merged into a single undo step.
   */
  record(snapshot: NgsHeadlessEditorSnapshot, group: string | null = null, now = Date.now()): void {
    const merge = group !== null &&
      group === this.lastGroup &&
      now - this.lastRecordedAt < NGS_HEADLESS_EDITOR_HISTORY_GROUP_DELAY &&
      this._past().length > 0;

    this.lastGroup = group;
    this.lastRecordedAt = now;
    this._future.set([]);
    if (merge) {
      return;
    }

    this._past.update(past => {
      const next = [...past, snapshot];
      return next.length > NGS_HEADLESS_EDITOR_HISTORY_LIMIT
        ? next.slice(next.length - NGS_HEADLESS_EDITOR_HISTORY_LIMIT)
        : next;
    });
  }

  /** Starts a new undo step for the next recorded change. */
  breakGroup(): void {
    this.lastGroup = null;
  }

  undo(current: NgsHeadlessEditorSnapshot): NgsHeadlessEditorSnapshot | null {
    const past = this._past();
    const previous = past.at(-1);
    if (!previous) {
      return null;
    }

    this.breakGroup();
    this._past.set(past.slice(0, -1));
    this._future.update(future => [...future, current]);
    return previous;
  }

  redo(current: NgsHeadlessEditorSnapshot): NgsHeadlessEditorSnapshot | null {
    const future = this._future();
    const next = future.at(-1);
    if (!next) {
      return null;
    }

    this.breakGroup();
    this._future.set(future.slice(0, -1));
    this._past.update(past => [...past, current]);
    return next;
  }

  clear(): void {
    this.breakGroup();
    this._past.set([]);
    this._future.set([]);
  }
}
