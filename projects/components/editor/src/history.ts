import { computed, Injectable, signal } from '@angular/core';
import {
  cloneNgsEditorDocument,
  NgsEditorDocument,
  NgsEditorSelection
} from './model';

export interface NgsEditorSnapshot {
  readonly document: NgsEditorDocument;
  readonly selection: NgsEditorSelection | null;
}

@Injectable()
export class NgsEditorHistory {
  private readonly _past = signal<readonly NgsEditorSnapshot[]>([]);
  private readonly _future = signal<readonly NgsEditorSnapshot[]>([]);

  readonly canUndo = computed(() => this._past().length > 0);
  readonly canRedo = computed(() => this._future().length > 0);

  record(snapshot: NgsEditorSnapshot): void {
    this._past.update(past => [...past, cloneSnapshot(snapshot)]);
    this._future.set([]);
  }

  undo(current: NgsEditorSnapshot): NgsEditorSnapshot | null {
    const past = this._past();
    const previous = past.at(-1);
    if (!previous) {
      return null;
    }

    this._past.set(past.slice(0, -1));
    this._future.update(future => [...future, cloneSnapshot(current)]);
    return cloneSnapshot(previous);
  }

  redo(current: NgsEditorSnapshot): NgsEditorSnapshot | null {
    const future = this._future();
    const next = future.at(-1);
    if (!next) {
      return null;
    }

    this._future.set(future.slice(0, -1));
    this._past.update(past => [...past, cloneSnapshot(current)]);
    return cloneSnapshot(next);
  }

  clear(): void {
    this._past.set([]);
    this._future.set([]);
  }
}

function cloneSnapshot(snapshot: NgsEditorSnapshot): NgsEditorSnapshot {
  return {
    document: cloneNgsEditorDocument(snapshot.document),
    selection: snapshot.selection
      ? {
        anchor: { ...snapshot.selection.anchor },
        focus: { ...snapshot.selection.focus }
      }
      : null
  };
}
