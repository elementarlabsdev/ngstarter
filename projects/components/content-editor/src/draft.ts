import { signal } from '@angular/core';
import { ContentEditorDocument } from './types';

export type ContentEditorDraftStatus = 'disabled' | 'idle' | 'saving' | 'saved' | 'error';
export interface ContentEditorDraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export interface ContentEditorDraftConfig { storage?: ContentEditorDraftStorage; debounceMs?: number; }
const browserStorage: ContentEditorDraftStorage = {
  getItem: key => globalThis.localStorage.getItem(key),
  setItem: (key, value) => globalThis.localStorage.setItem(key, value),
  removeItem: key => globalThis.localStorage.removeItem(key)
};

/** Delayed persistence keeps storage errors visible and flushes before switching documents. */
export class ContentEditorDraftController {
  readonly status = signal<ContentEditorDraftStatus>('disabled');
  readonly error = signal('');
  readonly savedAt = signal<number | null>(null);
  private key = '';
  private storage = browserStorage;
  private debounceMs = 500;
  private enabled = false;
  private pending: ContentEditorDocument | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  configure(key: string, enabled: boolean, config: ContentEditorDraftConfig = {}): void {
    const storage = config.storage ?? browserStorage;
    if (this.key !== key || this.enabled !== enabled || this.storage !== storage) {
      this.flush(); this.key = key; this.enabled = enabled; this.storage = storage;
      this.status.set(enabled ? 'idle' : 'disabled'); this.error.set(''); this.savedAt.set(null);
    }
    this.debounceMs = Number.isFinite(config.debounceMs) ? Math.max(0, config.debounceMs!) : 500;
  }
  read(validate: (source: unknown) => ContentEditorDocument): ContentEditorDocument | null {
    if (!this.enabled) return null;
    try {
      const source = this.storage.getItem(this.key);
      if (!source) return null;
      const document = validate(source);
      this.status.set('saved'); return document;
    } catch (error) { this.fail(error); return null; }
  }
  schedule(document: ContentEditorDocument): void {
    if (!this.enabled) return;
    this.pending = document;
    this.status.set('saving'); this.error.set('');
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.debounceMs);
  }
  flush(): void {
    if (this.timer) clearTimeout(this.timer); this.timer = null;
    if (!this.enabled || !this.pending) return;
    const document = this.pending; this.pending = null;
    try { this.storage.setItem(this.key, JSON.stringify(document)); this.status.set('saved'); this.error.set(''); this.savedAt.set(Date.now()); }
    catch (error) { this.fail(error); }
  }
  clear(): void {
    if (this.timer) clearTimeout(this.timer); this.timer = null; this.pending = null;
    if (!this.enabled) return;
    try { this.storage.removeItem(this.key); this.status.set('idle'); this.error.set(''); this.savedAt.set(null); }
    catch (error) { this.fail(error); }
  }
  private fail(error: unknown): void { this.error.set(error instanceof Error ? error.message : 'Could not save draft'); this.status.set('error'); }
}
