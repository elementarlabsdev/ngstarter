import { ContentEditorUploadTask } from './upload-task';
import { ContentEditorUploadContext } from './types';

const file = (name: string) => new File(['image'], name, { type: 'image/png' });
describe('Content editor media upload task', () => {
  it('reports transport progress, retains successful files and retries only failed files', async () => {
    const task = new ContentEditorUploadTask(() => true);
    const apply = vi.fn();
    let offline = true;
    const upload = vi.fn(async (file: File, _data: string, context: ContentEditorUploadContext) => {
      context.onProgress(50);
      if (offline && file.name === 'bad.png') throw new Error('Offline');
      return '/files/' + file.name;
    });
    await task.run({ files: [file('good.png'), file('bad.png')], upload, apply });
    expect(apply.mock.calls[0][0].map((result: any) => result.file.name)).toEqual(['good.png']);
    expect(task.canRetry()).toBe(true); expect(task.error()).toContain('Offline');
    offline = false; await task.retry();
    expect(upload.mock.calls.map(call => call[0].name)).toEqual(['good.png', 'bad.png', 'bad.png']);
    expect(apply.mock.calls[1][0][0].url).toBe('/files/bad.png');
    expect(task.progress()).toBe(100); expect(task.error()).toBe(''); expect(task.uploading()).toBe(false);
  });

  it('aborts the transport, completes cancellation even if it ignores abort, and rejects late results', async () => {
    const task = new ContentEditorUploadTask(() => true);
    const apply = vi.fn(); let context!: ContentEditorUploadContext; let finish!: (url: string) => void;
    const pending = task.run({ files: [file('photo.png')], apply, upload: (_file, _data, ctx) => {
      context = ctx; return new Promise(resolve => finish = resolve);
    } });
    await expect.poll(() => !!context).toBe(true);
    context.onProgress(50); expect(task.progress()).toBe(60);
    task.cancel(); await pending;
    expect(context.signal.aborted).toBe(true); expect(task.uploading()).toBe(false);
    finish('/late.png'); await Promise.resolve(); expect(apply).not.toHaveBeenCalled();
  });

  it('rejects invalid URLs, oversize files and commits nothing after the block becomes read-only or removed', async () => {
    let writable = true; const task = new ContentEditorUploadTask(() => writable);
    const apply = vi.fn(); const upload = vi.fn(async () => 'javascript:alert(1)');
    await task.run({ files: [file('large.png')], maxFileSize: 1, apply, upload });
    expect(upload).not.toHaveBeenCalled(); expect(task.canRetry()).toBe(false); expect(task.error()).toContain('too large');
    await task.run({ files: [file('photo.png')], apply, upload });
    expect(apply).not.toHaveBeenCalled(); expect(task.error()).toContain('Invalid upload URL');
    await task.run({ files: [file('photo.png')], urlKind: 'image', apply, upload: async () => 'data:text/html;base64,WA==' });
    expect(apply).not.toHaveBeenCalled(); expect(task.error()).toContain('Invalid upload URL');
    await task.run({ files: [file('photo.png')], apply, upload: async () => { writable = false; return '/late.png'; } });
    expect(apply).not.toHaveBeenCalled(); expect(task.uploading()).toBe(false);
  });
});
