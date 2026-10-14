import { signal } from '@angular/core';
import { ContentEditorUploadFn } from './types';
import { safeContentEditorHtmlUrl } from './html/html-utils';
import type { ContentEditorHtmlUrlKind } from './html/types';
import { readContentEditorFile } from './upload';

export interface ContentEditorUploadedFile { file: File; url: string; dataUrl: string; }
export interface ContentEditorUploadRequest {
  files: readonly File[];
  upload: ContentEditorUploadFn;
  accept?: (file: File) => boolean;
  urlKind?: ContentEditorHtmlUrlKind;
  maxFileSize?: number;
  apply(results: readonly ContentEditorUploadedFile[]): void;
}

/** One cancellable request per block. Retry only sends failed files again. */
export class ContentEditorUploadTask {
  readonly uploading = signal(false);
  readonly progress = signal<number | null>(null);
  readonly error = signal('');
  readonly canRetry = signal(false);
  private controller: AbortController | null = null;
  private failed: ContentEditorUploadRequest | null = null;
  constructor(private readonly writable: () => boolean) {}

  cancel(): void {
    this.controller?.abort(); this.controller = null;
    this.uploading.set(false); this.progress.set(null);
    this.failed = null; this.canRetry.set(false); this.error.set('');
  }
  retry(): Promise<void> { return this.failed ? this.run(this.failed) : Promise.resolve(); }

  async run(request: ContentEditorUploadRequest): Promise<void> {
    this.cancel();
    if (!request.files.length || !this.writable()) return;
    const controller = new AbortController(); this.controller = controller;
    const active = () => this.controller === controller && !controller.signal.aborted && this.writable();
    this.uploading.set(true);
    const progress = request.files.map(() => null as number | null);
    const report = (index: number, percent: number | null) => {
      if (!active()) return;
      progress[index] = percent;
      this.progress.set(progress.every(value => value !== null) ? progress.reduce<number>((sum, value) => sum + (value ?? 0), 0) / progress.length : null);
    };
    const results = await Promise.allSettled(request.files.map(async (file, index) => {
      if (request.accept && !request.accept(file)) throw new Error(`Unsupported file: ${file.name}`);
      if (request.maxFileSize !== undefined && file.size > request.maxFileSize) throw new Error(`File is too large: ${file.name}`);
      const dataUrl = await readContentEditorFile(file, { signal: controller.signal, onProgress: value => report(index, value * 0.2) });
      if (!active()) throw new DOMException('Upload cancelled', 'AbortError');
      report(index, null);
      const url = await abortable(request.upload(file, dataUrl, { signal: controller.signal, onProgress: value => {
        if (Number.isFinite(value)) report(index, 20 + Math.max(0, Math.min(100, value)) * 0.8);
      } }), controller.signal);
      if (!active()) throw new DOMException('Upload cancelled', 'AbortError');
      if (typeof url !== 'string' || !safeContentEditorHtmlUrl(url, request.urlKind ?? 'attachment')) throw new Error(`Invalid upload URL: ${file.name}`);
      report(index, 100);
      return { file, url, dataUrl };
    }));
    if (this.controller !== controller || controller.signal.aborted) return;
    if (!this.writable()) { this.cancel(); return; }
    const succeeded = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
    const failed = request.files.filter((_, index) => results[index].status === 'rejected');
    try { if (succeeded.length) request.apply(succeeded); }
    catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Could not save uploaded files.');
      this.failed = null; this.canRetry.set(false); this.uploading.set(false); return;
    }
    if (failed.length) {
      const reason = results.find(result => result.status === 'rejected') as PromiseRejectedResult;
      this.error.set(`Could not upload ${failed.length} file(s): ${reason.reason instanceof Error ? reason.reason.message : 'Upload failed'}`);
      const retryable = failed.filter(file => (!request.accept || request.accept(file)) && (request.maxFileSize === undefined || file.size <= request.maxFileSize));
      this.failed = retryable.length ? { ...request, files: retryable } : null; this.canRetry.set(!!this.failed);
    }
    this.uploading.set(false);
  }
}

function abortable<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('Upload cancelled', 'AbortError'));
    signal.addEventListener('abort', abort, { once: true });
    work.then(value => { signal.removeEventListener('abort', abort); resolve(value); }, error => { signal.removeEventListener('abort', abort); reject(error); });
    if (signal.aborted) abort();
  });
}
