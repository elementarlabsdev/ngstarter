import { ContentEditorDraftController, ContentEditorDraftStorage } from './draft';
import { contentEditorFromJson } from './import/from-json';

const document = { version: 1 as const, blocks: [{ id: 'p', type: 'paragraph', content: [{ type: 'text' as const, text: 'Saved', marks: [] }] }] };
describe('Content editor draft persistence', () => {
  afterEach(() => vi.useRealTimers());
  it('debounces edits, flushes the previous document before switching and restores validated data', () => {
    vi.useFakeTimers();
    const values = new Map<string, string>();
    const storage: ContentEditorDraftStorage = { getItem: key => values.get(key) ?? null, setItem: vi.fn((key, value) => { values.set(key, value); }), removeItem: key => { values.delete(key); } };
    const drafts = new ContentEditorDraftController();
    drafts.configure('a', true, { storage, debounceMs: 500 });
    drafts.schedule(document); drafts.schedule(document);
    expect(drafts.status()).toBe('saving'); vi.advanceTimersByTime(499);
    expect(storage.setItem).not.toHaveBeenCalled();
    drafts.configure('b', true, { storage });
    expect(storage.setItem).toHaveBeenCalledTimes(1); expect(values.has('a')).toBe(true); expect(values.has('b')).toBe(false);
    drafts.configure('a', true, { storage });
    expect(drafts.read(contentEditorFromJson)).toEqual(document); expect(drafts.status()).toBe('saved');
    drafts.clear(); expect(values.has('a')).toBe(false); expect(drafts.status()).toBe('idle');
  });

  it('exposes storage and validation errors and supports a successful retry', () => {
    const storage = { getItem: () => '{"version":1,"blocks":[{"id":"bad","type":"paragraph","content":null}]}', setItem: vi.fn((_key: string, _value: string): void => { throw new Error('Quota exceeded'); }), removeItem: vi.fn() };
    const drafts = new ContentEditorDraftController(); drafts.configure('a', true, { storage });
    expect(drafts.read(contentEditorFromJson)).toBeNull(); expect(drafts.status()).toBe('error'); expect(drafts.error()).toContain('content');
    drafts.schedule(document); drafts.flush(); expect(drafts.error()).toBe('Quota exceeded');
    storage.setItem.mockImplementation(() => {});
    drafts.schedule(document); drafts.flush(); expect(drafts.status()).toBe('saved'); expect(drafts.error()).toBe('');
    drafts.configure('a', false, { storage }); drafts.schedule(document); drafts.flush();
    expect(storage.setItem).toHaveBeenCalledTimes(2); expect(drafts.status()).toBe('disabled');
  });
});
