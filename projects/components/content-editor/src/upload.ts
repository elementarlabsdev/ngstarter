import type { ContentEditorUploadContext } from './types';

/** Read files with actual cancellation and progress. */
export function readContentEditorFile(file: File, context?: ContentEditorUploadContext): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const abort = () => { reader.abort(); reject(new DOMException('Upload cancelled', 'AbortError')); cleanup(); };
    const cleanup = () => context?.signal.removeEventListener('abort', abort);
    if (context?.signal.aborted) { abort(); return; }
    context?.signal.addEventListener('abort', abort, { once: true });
    reader.onload = () => { cleanup(); typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read file')); };
    reader.onerror = () => { cleanup(); reject(new Error('Could not read file')); };
    reader.onabort = () => { cleanup(); reject(new DOMException('Upload cancelled', 'AbortError')); };
    reader.onprogress = event => { if (event.lengthComputable) context?.onProgress(event.loaded / event.total * 100); };
    reader.readAsDataURL(file);
  });
}
export function contentEditorFileSize(size: number): string {
  if (!Number.isFinite(size) || size < 0) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
export function contentEditorResourceUrl(url: string): string {
  const value = url.trim();
  if (!value || /[\u0000-\u0020]/.test(value)) return '';
  const relative = !/^[a-z][a-z\d+.-]*:/i.test(value);
  return relative || /^(https?:|blob:|data:[^;,]+;base64,)/i.test(value) ? value : '';
}
