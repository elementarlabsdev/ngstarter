import { provideContentEditorConfig } from '../config';
import { Component, signal, viewChild } from '@angular/core';
import { ContentEditorDocument } from '../types';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createNgsHeadlessEditorText, NGS_HEADLESS_EDITOR_TOGGLE_BOLD } from '@ngstarter-ui/components/headless-editor';
import { ContentBuilderComponent } from './content-builder.component';
import { ContentEditorContentEditableDirective } from '../content-editor-content-editable.directive';
import { contentEditorText } from '../document';

@Component({
  imports: [ContentBuilderComponent],
  template: `<ngs-content-editor-builder [content]="document()"
    (contentChanged)="document.set($event)" [persistDraft]="false"/>`
})
class BoundDocumentHost {
  readonly document = signal<ContentEditorDocument>({ version: 1, blocks: [
    { id: 'p', type: 'paragraph', content: [createNgsHeadlessEditorText('Hello')] }
  ] });
  readonly builder = viewChild.required(ContentBuilderComponent);
}

describe('Content builder with a headless document', () => {
  let fixture: ComponentFixture<ContentBuilderComponent>;
  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [ContentBuilderComponent] });
    fixture = TestBed.createComponent(ContentBuilderComponent);
    fixture.componentRef.setInput('persistDraft', false);
    fixture.componentRef.setInput('content', { version: 1, blocks: [
      { id: 'p', type: 'paragraph', content: [createNgsHeadlessEditorText('Hello')], attrs: { props: [{ name: 'text-alignment', value: 'right' }] } },
      { id: 'table', type: 'table', content: null, attrs: { rows: [[[createNgsHeadlessEditorText('Cell')]]], header: false, cellMetadata: [[{ props: [], options: { colspan: 2, rowspan: 3 } }]] } }
    ] });
    fixture.autoDetectChanges();
    await fixture.whenStable();
    await expect.poll(() => fixture.debugElement.queryAll(By.directive(ContentEditorContentEditableDirective)).length).toBe(3);
  });
  afterEach(() => TestBed.resetTestingModule());

  it('loads native inputs, includes a trailing paragraph and starts without user history', () => {
    expect(fixture.componentInstance.getData().version).toBe(1);
    expect(fixture.componentInstance.getData().blocks).toHaveLength(3);
    expect(fixture.componentInstance.editor.canUndo()).toBe(false);
    expect(fixture.nativeElement.querySelector('ngs-paragraph-block .align-right')).toBeTruthy();
  });

  it('keeps an empty paragraph placeholder on the caret line without adding height', async () => {
    const surface = fixture.nativeElement.querySelector('ngs-paragraph-block .content[data-empty]') as HTMLElement;
    const paragraph = surface.querySelector('p') as HTMLElement;
    const emptyHeight = surface.getBoundingClientRect().height;

    expect(surface.getAttribute('data-empty-placeholder')).toBeTruthy();
    expect(emptyHeight).toBeGreaterThan(0);
    expect(Math.abs(paragraph.getBoundingClientRect().top - surface.getBoundingClientRect().top)).toBeLessThan(1);
    expect(Math.abs(emptyHeight - paragraph.getBoundingClientRect().height)).toBeLessThan(1);

    surface.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
    const selection = document.getSelection();
    expect(paragraph.contains(selection?.anchorNode ?? null)).toBe(true);
    surface.dispatchEvent(new InputEvent('beforeinput', {
      inputType: 'insertText', data: 'A', bubbles: true, cancelable: true
    }));
    await fixture.whenStable();

    expect(surface.textContent).toBe('A');
    expect(surface.hasAttribute('data-empty')).toBe(false);
    expect(Math.abs(surface.getBoundingClientRect().height - emptyHeight)).toBeLessThan(1);
    fixture.componentInstance.editor.undo();
    await fixture.whenStable();
    expect(surface.hasAttribute('data-empty')).toBe(true);
    expect(Math.abs(surface.getBoundingClientRect().height - emptyHeight)).toBeLessThan(1);
  });

  it('uses native commands in actual paragraph and table block components', async () => {
    const element = fixture.debugElement.queryAll(By.directive(ContentEditorContentEditableDirective))[1];
    const directive = element.injector.get(ContentEditorContentEditableDirective);
    directive.activate();
    directive.region.editor.setSelection({ anchor: { blockId: 'line-0', offset: 0 }, focus: { blockId: 'line-0', offset: 4 } });
    fixture.componentInstance.editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);
    await fixture.whenStable();
    const table: any = fixture.componentInstance.getData().blocks[1];
    expect(table.attrs.rows[0][0][0].marks).toEqual([{ type: 'bold', attrs: undefined }]);
    expect(table.attrs.cellMetadata[0][0].options).toEqual({ colspan: 2, rowspan: 3 });
    fixture.componentInstance.editor.undo();
    await fixture.whenStable();
    expect(element.nativeElement.querySelector('strong')).toBeNull();
  });

  it('inserts, duplicates and reorders blocks through the document history', async () => {
    const builder = fixture.componentInstance;
    const inserted = builder.insertBlock('heading', 1, { level: 1 }, false, [createNgsHeadlessEditorText('Title')]);
    expect(inserted.attrs?.['settings']).toEqual({ level: 1 });
    builder.duplicateBlock(inserted.id);
    expect(builder.getData().blocks.filter(block => block.type === 'heading')).toHaveLength(2);
    builder.editor.undo();
    expect(builder.getData().blocks.filter(block => block.type === 'heading')).toHaveLength(1);
    builder.editor.undo();
    expect(builder.getData().blocks.some(block => block.type === 'heading')).toBe(false);
    builder.editor.redo();
    await fixture.whenStable();
    expect(contentEditorText(builder.getData().blocks[1].content)).toBe('Title');
  });

  it('pastes structured HTML with the importer as one undoable operation', async () => {
    const builder = fixture.componentInstance;
    const before = builder.getData();
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/html', '<h2>Title</h2><table><tr><td><b>Cell</b></td></tr></table>');
    fixture.nativeElement.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(builder.getData().blocks.filter(block => block.type === 'heading')).toHaveLength(1);
    const table: any = builder.getData().blocks.filter(block => block.type === 'table').at(-1);
    expect(table.attrs.rows[0][0][0].marks[0].type).toBe('bold');
    builder.editor.undo();
    expect(builder.getData()).toEqual(before);
  });

  it('converts selected text through every text block type without losing marks or selection', async () => {
    const builder = fixture.componentInstance;
    const element = fixture.debugElement.query(By.directive(ContentEditorContentEditableDirective));
    const region = element.injector.get(ContentEditorContentEditableDirective);
    region.activate();
    const selection = { anchor: { blockId: 'line-0', offset: 1 }, focus: { blockId: 'line-0', offset: 4 } };
    region.region.editor.setSelection(selection);
    builder.editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);
    await fixture.whenStable();
    const original = builder.getData();
    for (const type of ['heading', 'quote', 'callout', 'paragraph'] as const) {
      expect(builder.convertBlock('p', type)).toBe(true);
      await fixture.whenStable();
      await expect.poll(() => fixture.nativeElement.querySelector('[data-block-id="p"] .ngs-content-editor-content-editable')?.textContent).toBe('Hello');
      const surface = fixture.nativeElement.querySelector('[data-block-id="p"] .ngs-content-editor-content-editable');
      const current = ContentEditorContentEditableDirective.forElement(surface)!;
      await expect.poll(() => current.region.editor.selection()).toEqual(selection);
      expect(surface.querySelector('strong')?.textContent).toBe('ell');
    }
    builder.editor.undo(); expect(builder.getData().blocks[0].type).toBe('callout');
    builder.editor.undo(); builder.editor.undo(); builder.editor.undo();
    expect(builder.getData()).toEqual(original);
  });

  it('inserts into nested collections, renews ids and rejects stale destinations atomically', async () => {
    const builder = fixture.componentInstance;
    builder.importJson({ version: 1, blocks: [{ id: 'grid', type: 'grid', content: { cells: [
      { id: 'cell', blocks: [{ id: 'toggle', type: 'toggle', content: { title: [], blocks: [{ id: 'child', type: 'paragraph', content: [] }] } }] }
    ] } }] });
    const before = builder.getData();
    builder.importHtml('<h2><b>Imported</b></h2><p>Body</p>', {}, { mode: 'insert', target: { scope: { parentId: 'toggle' }, afterId: 'child' } });
    const grid: any = builder.getData().blocks[0];
    expect(grid.content.cells[0].blocks[0].content.blocks.map((block: any) => block.type)).toEqual(['paragraph', 'heading', 'paragraph']);
    builder.editor.undo(); expect(builder.getData()).toEqual(before);
    builder.importJson(before, {}, { mode: 'insert', target: { scope: { parentId: 'grid', cellId: 'cell' } } });
    const inserted: any = (builder.getData().blocks[0].content as any).cells[0].blocks.at(-1);
    expect(inserted.id).not.toBe('grid');
    expect(inserted.content.cells[0].id).not.toBe('cell');
    expect(inserted.content.cells[0].blocks[0].content.blocks[0].id).not.toBe('child');
    builder.editor.undo(); expect(builder.getData()).toEqual(before);
    expect(() => builder.importHtml('<p>Invalid destination</p>', {}, { mode: 'insert', target: { scope: { parentId: 'grid', cellId: 'missing' } } })).toThrow('Insertion collection');
    expect(builder.getData()).toEqual(before);
    await fixture.whenStable();
  });

  it('pastes lists and tables at the caret without flattening them or losing surrounding text', async () => {
    const builder = fixture.componentInstance;
    const original = builder.getData();
    const surface = fixture.nativeElement.querySelector('[data-block-id="p"] [contenteditable]') as HTMLElement;
    const region = ContentEditorContentEditableDirective.forElement(surface)!;
    region.region.editor.setSelection({ anchor: { blockId: 'line-0', offset: 2 }, focus: { blockId: 'line-0', offset: 3 } }); region.focus();
    const clipboardData = new DataTransfer(); clipboardData.setData('text/html', '<ul><li><b>Item</b></li></ul><table><tr><td>Cell</td></tr></table>');
    surface.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true })); await fixture.whenStable();
    const blocks = builder.getData().blocks;
    expect(blocks.slice(0, 4).map(block => block.type)).toEqual(['paragraph', 'bulletList', 'table', 'paragraph']);
    expect(contentEditorText(blocks[0].content)).toBe('He'); expect(contentEditorText(blocks[3].content)).toBe('lo');
    expect((blocks[1].content as any)[0].content[0].marks[0].type).toBe('bold');
    builder.editor.undo(); await fixture.whenStable(); expect(builder.getData()).toEqual(original);
  });

  it('emits document changes from undo/redo as well as edits', async () => {
    const changes: any[] = [];
    fixture.componentInstance.contentChanged.subscribe(value => changes.push(value));
    fixture.componentInstance.duplicateBlock('p');
    await fixture.whenStable();
    fixture.componentInstance.editor.undo();
    await fixture.whenStable();
    expect(changes.map(value => value.version)).toEqual([1, 1]);
    expect(changes[0].blocks).toHaveLength(4);
    expect(changes[1].blocks).toHaveLength(3);
  });
});

describe('Content editor bound native document', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('preserves history when a consumer feeds contentChanged back into content', async () => {
    TestBed.configureTestingModule({ imports: [BoundDocumentHost] });
    const fixture = TestBed.createComponent(BoundDocumentHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    await expect.poll(() => fixture.debugElement.queryAll(By.directive(ContentEditorContentEditableDirective)).length).toBe(2);
    const region = fixture.debugElement.query(By.directive(ContentEditorContentEditableDirective)).injector.get(ContentEditorContentEditableDirective);
    region.activate();
    region.region.editor.setSelection({ anchor: { blockId: 'line-0', offset: 0 }, focus: { blockId: 'line-0', offset: 5 } });
    const editor = fixture.componentInstance.builder().editor;
    editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);
    await fixture.whenStable();
    expect(editor.canUndo()).toBe(true);
    expect(fixture.componentInstance.document().blocks[0].content).toEqual([createNgsHeadlessEditorText('Hello', [{ type: 'bold' }])]);
    editor.undo();
    await fixture.whenStable();
    expect(fixture.componentInstance.document().blocks[0].content).toEqual([createNgsHeadlessEditorText('Hello')]);
    expect(editor.canRedo()).toBe(true);
  });
});


describe('Content editor document draft identity', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('restores independent document ids, flushes on switch, and exposes save failures', async () => {
    const values = new Map<string, string>(); let fail = false;
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { if (fail) throw new Error('Quota'); values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
    TestBed.configureTestingModule({ imports: [ContentBuilderComponent], providers: [provideContentEditorConfig({ draft: { storage, debounceMs: 100 } })] });
    const fixture = TestBed.createComponent(ContentBuilderComponent); fixture.componentRef.setInput('documentId', 'article-a');
    fixture.autoDetectChanges(); await fixture.whenStable();
    const builder = fixture.componentInstance;
    builder.importHtml('<p>Article A</p>'); fixture.detectChanges(); expect(builder.draftStatus()).toBe('saving');
    fixture.componentRef.setInput('documentId', 'article-b'); await fixture.whenStable();
    expect(values.get('ngs-content-editor-builder:draft:document:article-a')).toContain('Article A');
    builder.importHtml('<p>Article B</p>'); await fixture.whenStable(); builder.saveDraftNow(); expect(builder.draftStatus()).toBe('saved');
    fixture.componentRef.setInput('documentId', 'article-a'); await fixture.whenStable();
    expect(contentEditorText(builder.getData().blocks[0].content)).toBe('Article A');
    fail = true; builder.saveDraftNow(); expect(builder.draftStatus()).toBe('error'); expect(builder.draftError()).toBe('Quota');
    fail = false; builder.saveDraftNow(); expect(builder.draftStatus()).toBe('saved'); builder.clearDraft(); expect(builder.draftStatus()).toBe('idle');
  });
});
