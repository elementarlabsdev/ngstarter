import { TestBed } from '@angular/core/testing';
import { createNgsHeadlessEditorText, createNgsHeadlessEditorTable, getNgsHeadlessEditorTableData } from '@ngstarter-ui/components/headless-editor';
import { provideContentEditor } from './content-editor.plugin';
import { ContentBuilderStore } from './content-builder.store';
import { contentEditorText } from './document';

describe('ContentBuilderStore native document', () => {
  let store: ContentBuilderStore;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideContentEditor(), ContentBuilderStore] });
    store = TestBed.inject(ContentBuilderStore);
    store.setBlocks({ version: 1, blocks: [
      { id: 'p', type: 'paragraph', content: [createNgsHeadlessEditorText('Hello')] },
      { id: 'image', type: 'image', content: { src: '/image.png', alt: 'Before' }, attrs: { settings: { width: 320 } } }
    ] });
  });
  afterEach(() => TestBed.resetTestingModule());

  it('keeps settings in attrs and uses one history for text, media and order', () => {
    store.updateBlock('p', { content: [createNgsHeadlessEditorText('Hello', [{ type: 'bold' }])] });
    store.updateBlock('image', { settings: { width: 640 } });
    store.moveBlock(0, 1);
    expect(store.editor.document().blocks[0].id).toBe('image');
    store.editor.undo();
    expect(store.editor.document().blocks[0].id).toBe('p');
    store.editor.undo();
    expect(store.editor.document().blocks[1].attrs?.['settings']).toEqual({ width: 320 });
    store.editor.undo();
    expect(store.editor.document().blocks[0].content).toEqual([createNgsHeadlessEditorText('Hello')]);
    store.editor.redo();
    expect(store.editor.document().blocks[0].content).toEqual([createNgsHeadlessEditorText('Hello', [{ type: 'bold' }])]);
  });

  it('does not let mutable table UI or caller data modify history snapshots', () => {
    const rows = [[{ content: [createNgsHeadlessEditorText('Cell')], options: { colspan: 2, rowspan: 3, width: 120 } }]];
    store.addBlock({ id: 'table', type: 'table', content: rows, settings: {}, isEmpty: false }, 1);
    rows[0][0].options.width = 999;
    const view = store.blocks()[1];
    view.content[0][0].content = [createNgsHeadlessEditorText('Changed')];
    store.updateBlock('table', view);
    store.editor.undo();
    const saved = store.editor.document().blocks[1];
    expect(saved.content).toBeNull();
    const savedRows: any = saved.attrs?.['rows'];
    const metadata: any = saved.attrs?.['cellMetadata'];
    expect(contentEditorText(savedRows[0][0])).toBe('Cell');
    expect(metadata[0][0].options).toEqual({ colspan: 2, rowspan: 3, width: 120 });
  });

  it('accepts tables created by the shared headless table helpers', () => {
    store.setBlocks({ version: 1, blocks: [{ ...createNgsHeadlessEditorTable([['Header'], ['Cell']]), id: 't' }] });
    const view = store.blocks()[0];
    view.content[1][0].content = [createNgsHeadlessEditorText('Edited', [{ type: 'bold' }])];
    store.updateBlock('t', view);
    const table = getNgsHeadlessEditorTableData(store.editor.document().blocks[0]);
    expect(table.header).toBe(true);
    expect(table.rows[1][0]).toEqual([createNgsHeadlessEditorText('Edited', [{ type: 'bold' }])]);
  });

  it('loads an external document without preserving the previous undo stack', () => {
    store.deleteBlock('image', 1);
    expect(store.editor.canUndo()).toBe(true);
    store.setBlocks({ version: 1, blocks: [{ id: 'new', type: 'paragraph', content: [] }] });
    expect(store.editor.canUndo()).toBe(false);
    expect(store.editor.document().blocks[0].id).toBe('new');
  });
});
