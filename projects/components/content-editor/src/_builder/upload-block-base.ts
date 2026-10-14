import { DestroyRef, Directive, effect, inject } from '@angular/core';
import { ContentEditorBlockBase } from './block-base';
import { findContentEditorBlock } from '../document';
import { ContentEditorUploadTask, ContentEditorUploadRequest } from '../upload-task';

@Directive()
export abstract class ContentEditorUploadBlockBase<T, S extends object = Record<string, unknown>> extends ContentEditorBlockBase<T, S> {
  readonly uploadTask = new ContentEditorUploadTask(() => !this.store.editor.readOnly() && !!findContentEditorBlock(this.store.editor.document().blocks, this.id()));
  readonly uploading = this.uploadTask.uploading;
  readonly error = this.uploadTask.error;
  constructor() {
    super();
    effect(() => {
      if (this.store.editor.readOnly() || !findContentEditorBlock(this.store.editor.document().blocks, this.id())) this.uploadTask.cancel();
    });
    inject(DestroyRef).onDestroy(() => this.uploadTask.cancel());
  }
  protected uploadFiles(type: string, request: Omit<ContentEditorUploadRequest, 'upload' | 'maxFileSize'>): Promise<void> {
    return this.uploadTask.run({ ...request,
      urlKind: request.urlKind ?? (type === 'video' ? 'media' : type === 'image' || type === 'gallery' ? 'image' : 'attachment'),
      upload: this.builder.getBlockDefOption(type, 'uploadFn'),
      maxFileSize: this.builder.getBlockDefOption(type, 'maxFileSize')
    });
  }
  cancelUpload(): void { this.uploadTask.cancel(); }
}
