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
