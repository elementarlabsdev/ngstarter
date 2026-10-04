/** Read files for the default data URL upload or a consumer's uploadFn. */
export function readContentEditorFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read file'));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onabort = () => reject(new Error('File reading cancelled'));
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
