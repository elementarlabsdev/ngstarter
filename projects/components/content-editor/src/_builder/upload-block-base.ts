import { DestroyRef, Directive, inject, signal } from '@angular/core';
import { ContentEditorBlockBase } from './block-base';
import { findContentEditorBlock } from '../document';

@Directive()
export abstract class ContentEditorUploadBlockBase<T, S extends object = Record<string, unknown>> extends ContentEditorBlockBase<T, S> {
  readonly uploading = signal(false);
  readonly error = signal('');
  private request = 0;
  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => { this.request++; });
  }
  protected beginUpload(): number { this.uploading.set(true); this.error.set(''); return ++this.request; }
  protected isCurrentUpload(request: number): boolean {
    return request === this.request && !!findContentEditorBlock(this.store.editor.document().blocks, this.id());
  }
  cancelUpload(): void { this.request++; this.uploading.set(false); }
}
