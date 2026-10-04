import { TestBed } from '@angular/core/testing';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { By } from '@angular/platform-browser';
import { NGS_HEADLESS_EDITOR_TOGGLE_BOLD, createNgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { ContentBuilderComponent } from './content-builder.component';
import { ContentBuilderStore } from '../content-builder.store';
import { ContentEditorContentEditableDirective } from '../content-editor-content-editable.directive';
import { ContentEditorGridBlock } from '../_builder/grid-block/grid-block';
import { ContentEditorAttachmentBlock } from '../_builder/attachment-block/attachment-block';
import { ContentEditorGalleryBlock } from '../_builder/gallery-block/gallery-block';
import { ContentEditorNestedBlocks } from '../_builder/nested-blocks/nested-blocks';
import { contentEditorCollection, findContentEditorBlock, contentEditorText } from '../document';
import { ContentEditorGridContent, ContentEditorDocument } from '../types';
import { MenuTrigger } from '@ngstarter-ui/components/menu';
import { userEvent } from 'vitest/browser';
import '../../../../../node_modules/@angular/cdk/overlay-prebuilt.css';

const paragraph = (id: string, text: string) => ({ id, type: 'paragraph', content: [createNgsHeadlessEditorText(text)] });
const nestedDocument = (): ContentEditorDocument => ({ version: 1, blocks: [
  { id: 'grid', type: 'grid', content: { cells: [
    { id: 'left', blocks: [paragraph('left-text', 'Left')] },
    { id: 'right', blocks: [paragraph('right-text', 'Right')] }
  ] } },
  { id: 'toggle', type: 'toggle', content: { title: [createNgsHeadlessEditorText('Details')], blocks: [paragraph('details', 'Body')] }, attrs: { settings: { expanded: true } } }
] });

async function createBuilder(document: ContentEditorDocument, options = {}) {
  TestBed.configureTestingModule({ imports: [ContentBuilderComponent] });
  const fixture = TestBed.createComponent(ContentBuilderComponent);
  fixture.componentRef.setInput('persistDraft', false);
  fixture.componentRef.setInput('content', document);
  fixture.componentRef.setInput('options', options);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  await expect.poll(() => fixture.nativeElement.querySelectorAll('ngs-paragraph-block').length).toBeGreaterThan(0);
  return fixture;
}

describe('Content editor additional blocks', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('creates all five native block types and includes them in the insertion menu', async () => {
    const fixture = await createBuilder({ version: 1, blocks: [paragraph('p', '')] });
    const builder = fixture.componentInstance;
    for (const type of ['callout', 'toggle', 'attachment', 'gallery', 'grid']) {
      const block = builder.insertBlock(type, 0, {}, false);
      expect(block.type).toBe(type);
      expect(builder.suggestions().some((item: any) => item.blockType === type)).toBe(true);
    }
    await fixture.whenStable();
    await expect.poll(() => fixture.nativeElement.querySelector('ngs-content-editor-grid-block')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ngs-content-editor-callout-block')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ngs-content-editor-toggle-block')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ngs-content-editor-attachment-block')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('ngs-content-editor-gallery-block')).toBeTruthy();
  });

  it('formats nested text and restores it with root undo/redo', async () => {
    const fixture = await createBuilder(nestedDocument());
    await expect.poll(() => fixture.nativeElement.querySelector('[data-block-id="left-text"] [contenteditable]')).toBeTruthy();
    const regionElement = fixture.debugElement.queryAll(By.directive(ContentEditorContentEditableDirective))
      .find(element => element.nativeElement.closest('[data-block-id="left-text"]'))!;
    const region = regionElement.injector.get(ContentEditorContentEditableDirective);
    region.activate();
    region.region.editor.setSelection({ anchor: { blockId: 'line-0', offset: 0 }, focus: { blockId: 'line-0', offset: 4 } });
    const editor = fixture.componentInstance.editor;
    editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);
    await fixture.whenStable();
    expect((findContentEditorBlock(editor.document().blocks, 'left-text')!.content as any)[0].marks).toEqual([{ type: 'bold', attrs: undefined }]);
    editor.undo();
    await fixture.whenStable();
    expect(regionElement.nativeElement.querySelector('strong')).toBeNull();
    editor.redo();
    await fixture.whenStable();
    expect(regionElement.nativeElement.querySelector('strong')?.textContent).toBe('Left');
  });

  it('centers callout text and shows settings at the end on hover, focus and while the menu is open', async () => {
    const fixture = await createBuilder({ version: 1, blocks: [{
      id: 'callout', type: 'callout', content: [createNgsHeadlessEditorText('A useful note')],
      attrs: { settings: { variant: 'warning' } }
    }] });
    fixture.nativeElement.style.width = '700px';
    fixture.nativeElement.style.setProperty('--spacing', '0.25rem');
    await expect.poll(() => fixture.nativeElement.querySelector('button[aria-label="Callout style"]')).toBeTruthy();
    const alert = fixture.nativeElement.querySelector('ngs-alert') as HTMLElement;
    const button = alert.querySelector('button') as HTMLButtonElement;
    const text = alert.querySelector('[contenteditable]') as HTMLElement;
    const centerY = (element: HTMLElement) => {
      const bounds = element.getBoundingClientRect();
      return bounds.top + bounds.height / 2;
    };
    await userEvent.hover(fixture.nativeElement.querySelector('ngs-paragraph-block'));
    expect(getComputedStyle(button).opacity).toBe('0');
    expect(Math.abs(centerY(text) - centerY(alert))).toBeLessThan(1);
    expect(alert.getBoundingClientRect().right - button.getBoundingClientRect().right).toBeLessThan(10);
    const textWidth = text.getBoundingClientRect().width;

    await userEvent.hover(alert);
    expect(getComputedStyle(button).opacity).toBe('1');
    expect(text.getBoundingClientRect().width).toBe(textWidth);
    await userEvent.hover(fixture.nativeElement.querySelector('ngs-paragraph-block'));
    button.focus();
    expect(getComputedStyle(button).opacity).toBe('1');
    button.blur();
    expect(getComputedStyle(button).opacity).toBe('0');

    await userEvent.hover(alert);
    await userEvent.click(button);
    await fixture.whenStable();
    const panel = document.querySelector('.ngs-menu-panel') as HTMLElement;
    button.blur();
    await userEvent.hover(panel);
    expect(getComputedStyle(button).opacity).toBe('1');
    Array.from(panel.querySelectorAll<HTMLButtonElement>('button')).find(item => item.textContent?.trim() === 'tip')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.getData().blocks[0].attrs?.['settings']).toEqual({ variant: 'tip' });
    fixture.componentInstance.editor.undo();
    await fixture.whenStable();
    expect(fixture.componentInstance.getData().blocks[0].attrs?.['settings']).toEqual({ variant: 'warning' });

    fixture.nativeElement.style.width = '320px';
    fixture.debugElement.injector.get(ContentBuilderStore).updateBlock('callout', {
      content: [createNgsHeadlessEditorText('A longer note with enough words to wrap onto several lines inside the callout.')]
    });
    await fixture.whenStable();
    expect(text.getBoundingClientRect().height).toBeGreaterThan(40);
    expect(Math.abs(centerY(text) - centerY(alert))).toBeLessThan(1);
    expect(Math.abs(centerY(button) - centerY(alert))).toBeLessThan(1);
  });

  it('shares the root block menu across grid cells and toggles and inserts into the triggering collection', async () => {
    const documentValue = nestedDocument();
    const leftColumn = (documentValue.blocks[0].content as ContentEditorGridContent).cells[0];
    leftColumn.blocks = [...leftColumn.blocks, paragraph('left-tail', 'Tail')];
    const fixture = await createBuilder(documentValue);
    await expect.poll(() => fixture.debugElement.queryAll(By.directive(ContentEditorNestedBlocks)).length).toBe(3);
    const builder = fixture.componentInstance;
    const rootCount = builder.getData().blocks.length;

    for (const collection of fixture.debugElement.queryAll(By.directive(ContentEditorNestedBlocks))) {
      const nested = collection.componentInstance as ContentEditorNestedBlocks;
      expect(Array.from(collection.nativeElement.querySelectorAll('button'))
        .some((button: any) => button.textContent.includes('Add block'))).toBe(false);
      const triggerElement = collection.queryAll(By.directive(MenuTrigger))
        .find(element => element.nativeElement.getAttribute('aria-label') === 'Add block')!;
      const trigger = triggerElement.injector.get(MenuTrigger);
      expect(trigger.menu()).toBe(builder.blockMenu());
      const before = contentEditorCollection(builder.getData().blocks, nested.scope()).length;
      triggerElement.nativeElement.click();
      await fixture.whenStable();

      const panel = document.querySelector('.ngs-menu-panel') as HTMLElement;
      expect(panel.textContent).toContain('Headings');
      expect(panel.textContent).toContain('Top-level heading');
      const item = Array.from(panel.querySelectorAll<HTMLButtonElement>('button[ngs-menu-item]'))
        .find(button => button.textContent?.includes('Heading 1'))!;
      item.click();
      await fixture.whenStable();

      const blocks = contentEditorCollection(builder.getData().blocks, nested.scope());
      expect(blocks).toHaveLength(before + 1);
      expect(blocks[1]?.type).toBe('heading');
      expect(blocks[1]?.attrs?.['settings']).toEqual({ level: 1 });
      if (nested.scope().cellId === 'left') expect(blocks[2].id).toBe('left-tail');
      expect(builder.getData().blocks).toHaveLength(rootCount);
      expect(trigger.menuOpen()).toBe(false);
      builder.editor.undo();
      await fixture.whenStable();
      expect(contentEditorCollection(builder.getData().blocks, nested.scope())).toHaveLength(before);
    }

    const rootTrigger = fixture.debugElement.queryAll(By.directive(MenuTrigger))
      .find(element => element.nativeElement.closest('.block-controls'))!.nativeElement as HTMLElement;
    rootTrigger.click();
    await fixture.whenStable();
    const item = Array.from(document.querySelectorAll<HTMLButtonElement>('.ngs-menu-panel button[ngs-menu-item]'))
      .find(button => button.textContent?.includes('Heading 1'))!;
    item.click();
    await fixture.whenStable();
    expect(builder.getData().blocks.map(block => block.type)).toEqual(['grid', 'heading', 'toggle', 'paragraph']);
  });

  it('allows typing and the shared plus menu in an empty grid cell without inserting a separate Add block row', async () => {
    const documentValue = nestedDocument();
    (documentValue.blocks[0].content as ContentEditorGridContent).cells[0].blocks = [];
    const fixture = await createBuilder(documentValue);
    const builder = fixture.componentInstance;
    const scope = { parentId: 'grid', cellId: 'left' };
    await expect.poll(() => fixture.debugElement.queryAll(By.directive(ContentEditorNestedBlocks)).length).toBe(3);
    const collection = fixture.debugElement.queryAll(By.directive(ContentEditorNestedBlocks))
      .find(element => element.componentInstance.scope().cellId === 'left')!;
    expect(builder.editor.canUndo()).toBe(false);
    expect(contentEditorCollection(builder.getData().blocks, scope)).toHaveLength(0);

    const surface = collection.nativeElement.querySelector('[contenteditable="true"]') as HTMLElement;
    surface.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
    surface.dispatchEvent(new InputEvent('beforeinput', {
      inputType: 'insertText', data: 'New', bubbles: true, cancelable: true
    }));
    await fixture.whenStable();
    expect(contentEditorText(contentEditorCollection(builder.getData().blocks, scope)[0].content)).toBe('New');
    builder.editor.undo();
    await fixture.whenStable();
    expect(contentEditorCollection(builder.getData().blocks, scope)).toHaveLength(0);
    expect(builder.editor.canUndo()).toBe(false);

    collection.nativeElement.querySelector('button[aria-label="Add block"]').click();
    await fixture.whenStable();
    const item = Array.from(document.querySelectorAll<HTMLButtonElement>('.ngs-menu-panel button[ngs-menu-item]'))
      .find(button => button.textContent?.includes('Heading 1'))!;
    item.click();
    await fixture.whenStable();
    expect(contentEditorCollection(builder.getData().blocks, scope)[0].type).toBe('heading');
    builder.editor.undo();
    await fixture.whenStable();
    expect(contentEditorCollection(builder.getData().blocks, scope)).toHaveLength(0);
  });

  it('keeps slash input as text in empty nested paragraphs and adds a paragraph on Enter', async () => {
    const value = nestedDocument();
    (value.blocks[0].content as ContentEditorGridContent).cells[0].blocks = [];
    (value.blocks[1].content as any).blocks = [];
    const fixture = await createBuilder(value);
    const builder = fixture.componentInstance;
    const collections = fixture.debugElement.queryAll(By.directive(ContentEditorNestedBlocks))
      .filter(element => element.componentInstance.scope().cellId === 'left' || element.componentInstance.scope().parentId === 'toggle');

    for (const collection of collections) {
      const nested = collection.componentInstance as ContentEditorNestedBlocks;
      const first = collection.query(By.directive(ContentEditorContentEditableDirective));
      first.injector.get(ContentEditorContentEditableDirective).focus();
      await userEvent.type(first.nativeElement, '/heading');
      await fixture.whenStable();
      expect(document.querySelector('.ngs-menu-panel')).toBeNull();
      expect(contentEditorCollection(builder.getData().blocks, nested.scope())).toHaveLength(1);
      expect(contentEditorText(contentEditorCollection(builder.getData().blocks, nested.scope())[0].content), JSON.stringify(nested.scope())).toBe('/heading');
      expect(document.activeElement).toBe(first.nativeElement);

      await userEvent.keyboard('{Enter}');
      await fixture.whenStable();
      await expect.poll(() => collection.nativeElement.querySelectorAll('ngs-paragraph-block').length).toBe(2);
      expect(contentEditorCollection(builder.getData().blocks, nested.scope()).map(block => block.type)).toEqual(['paragraph', 'paragraph']);
      expect(document.querySelector('.ngs-menu-panel')).toBeNull();
      builder.editor.undo();
      await fixture.whenStable();
      expect(contentEditorCollection(builder.getData().blocks, nested.scope())).toHaveLength(1);
      expect(contentEditorText(contentEditorCollection(builder.getData().blocks, nested.scope())[0].content), JSON.stringify(nested.scope())).toBe('/heading');
    }
  });

  it('keeps typing in one nested paragraph and adds the next only on Enter in empty grid cells and populated toggles', async () => {
    const value = nestedDocument();
    (value.blocks[0].content as ContentEditorGridContent).cells[0].blocks = [];
    const fixture = await createBuilder(value);
    const builder = fixture.componentInstance;
    const collections = fixture.debugElement.queryAll(By.directive(ContentEditorNestedBlocks))
      .filter(element => element.componentInstance.scope().cellId === 'left' || element.componentInstance.scope().parentId === 'toggle');

    for (const collection of collections) {
      const nested = collection.componentInstance as ContentEditorNestedBlocks;
      const first = collection.query(By.directive(ContentEditorContentEditableDirective));
      const region = first.injector.get(ContentEditorContentEditableDirective);
      const offset = contentEditorText(region.region.content()).length;
      region.region.editor.setSelection({ anchor: { blockId: 'line-0', offset }, focus: { blockId: 'line-0', offset } });
      region.focus();
      await userEvent.type(first.nativeElement, 'Text');
      await fixture.whenStable();
      expect(contentEditorCollection(builder.getData().blocks, nested.scope())).toHaveLength(1);
      expect(collection.nativeElement.querySelectorAll('ngs-paragraph-block')).toHaveLength(1);
      expect(document.activeElement).toBe(first.nativeElement);

      first.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      await fixture.whenStable();
      await expect.poll(() => collection.nativeElement.querySelectorAll('ngs-paragraph-block').length).toBe(2);
      expect(contentEditorCollection(builder.getData().blocks, nested.scope())).toHaveLength(2);
      const second = collection.queryAll(By.directive(ContentEditorContentEditableDirective))[1];
      expect(document.activeElement).toBe(second.nativeElement);
      await userEvent.type(second.nativeElement, 'Next');
      await fixture.whenStable();
      expect(contentEditorCollection(builder.getData().blocks, nested.scope())).toHaveLength(2);
      expect(collection.nativeElement.querySelectorAll('ngs-paragraph-block')).toHaveLength(2);
      expect(contentEditorText(contentEditorCollection(builder.getData().blocks, nested.scope())[1].content)).toBe('Next');
    }
  });

  it('keeps slash input as text in root paragraphs without opening the block menu', async () => {
    const fixture = await createBuilder({ version: 1, blocks: [paragraph('p', '')] });
    const element = fixture.debugElement.query(By.directive(ContentEditorContentEditableDirective));
    element.injector.get(ContentEditorContentEditableDirective).focus();
    await userEvent.type(element.nativeElement, '/heading');
    await fixture.whenStable();
    expect(document.querySelector('.ngs-menu-panel')).toBeNull();
    expect(contentEditorText(fixture.componentInstance.getData().blocks[0].content)).toBe('/heading');
    expect(fixture.componentInstance.getData().blocks).toHaveLength(1);

    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    expect(fixture.componentInstance.getData().blocks.map(block => block.type)).toEqual(['paragraph', 'paragraph']);
    expect(document.querySelector('.ngs-menu-panel')).toBeNull();
    fixture.componentInstance.editor.undo();
    await fixture.whenStable();
    expect(fixture.componentInstance.getData().blocks).toHaveLength(1);
    expect(contentEditorText(fixture.componentInstance.getData().blocks[0].content)).toBe('/heading');
  });

  it('moves blocks across grid cells and toggles, prevents cycles, and undoes the move', async () => {
    const fixture = await createBuilder(nestedDocument());
    const store = fixture.debugElement.injector.get(ContentBuilderStore);
    store.moveBetweenCollections(0, 1, { parentId: 'grid', cellId: 'left' }, { parentId: 'toggle' });
    expect(contentEditorCollection(store.editor.document().blocks, { parentId: 'toggle' }).map(block => block.id)).toEqual(['details', 'left-text']);
    expect(contentEditorCollection(store.editor.document().blocks, { parentId: 'grid', cellId: 'left' })).toHaveLength(0);
    store.editor.undo();
    expect(contentEditorCollection(store.editor.document().blocks, { parentId: 'grid', cellId: 'left' })[0].id).toBe('left-text');
    const before = store.editor.document();
    store.moveBetweenCollections(0, 0, {}, { parentId: 'grid', cellId: 'left' });
    expect(store.editor.document()).toBe(before);
    store.deleteBlock('right-text', 0);
    expect(findContentEditorBlock(store.editor.document().blocks, 'right-text')).toBeUndefined();
    store.editor.undo();
    expect(findContentEditorBlock(store.editor.document().blocks, 'right-text')).toBeTruthy();
  });

  it('routes real CDK pointer dragging into the nested target rather than the outer document', async () => {
    const fixture = await createBuilder(nestedDocument());
    await expect.poll(() => fixture.nativeElement.querySelector('[data-block-id="left-text"] button[cdkDragHandle]')).toBeTruthy();
    const handle: HTMLElement = fixture.nativeElement.querySelector('[data-block-id="left-text"] button[cdkDragHandle]');
    const target: HTMLElement = fixture.nativeElement.querySelectorAll('ngs-content-editor-grid-block ngs-content-editor-nested-blocks [cdkDropList]')[1];
    const sourceRect = handle.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const start = { x: sourceRect.x + sourceRect.width / 2, y: sourceRect.y + sourceRect.height / 2 };
    const end = { x: targetRect.x + targetRect.width / 2, y: targetRect.bottom - 4 };
    let started = 0, moved = 0; let dropped: any = null;
    const drag = fixture.debugElement.queryAll(By.directive(CdkDrag)).find(element => element.nativeElement.getAttribute('data-block-id') === 'left-text')!.injector.get(CdkDrag);
    drag.started.subscribe(() => started++); drag.moved.subscribe(() => moved++); drag.dropped.subscribe(event => dropped = event.container.data);
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, buttons: 1, detail: 1, clientX: start.x, clientY: start.y }));
    for (const point of [{ x: start.x + 10, y: start.y }, { x: end.x - 10, y: end.y }, end, { x: end.x + 1, y: end.y }]) {
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, buttons: 1, clientX: point.x, clientY: point.y }));
      await fixture.whenStable();
    }
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0, clientX: end.x, clientY: end.y }));
    await fixture.whenStable();
    const editor = fixture.componentInstance.editor;
    expect(started).toBe(1);
    expect(moved).toBeGreaterThan(0);
    expect(dropped).toEqual({ parentId: 'grid', cellId: 'right' });
    await expect.poll(() => contentEditorCollection(editor.document().blocks, { parentId: 'grid', cellId: 'right' }).map(block => block.id)).toContain('left-text');
    expect(contentEditorCollection(editor.document().blocks, { parentId: 'grid', cellId: 'left' })).toHaveLength(0);
    editor.undo();
    expect(contentEditorCollection(editor.document().blocks, { parentId: 'grid', cellId: 'left' })[0].id).toBe('left-text');
  });

  it('reflows cells without losing text, shares layout history, and regenerates nested IDs when duplicating', async () => {
    const fixture = await createBuilder(nestedDocument());
    await expect.poll(() => fixture.debugElement.query(By.directive(ContentEditorGridBlock))).toBeTruthy();
    const component: ContentEditorGridBlock = fixture.debugElement.query(By.directive(ContentEditorGridBlock)).componentInstance;
    const store = fixture.debugElement.injector.get(ContentBuilderStore);
    component.addCell();
    await fixture.whenStable();
    const cells = (findContentEditorBlock(store.editor.document().blocks, 'grid')!.content as ContentEditorGridContent).cells;
    const thirdParagraph = cells[2].blocks[0];
    store.updateBlock(thirdParagraph.id, { content: [createNgsHeadlessEditorText('Third')] });
    await fixture.whenStable();
    component.changeSettings({ columns: 3, gap: 'large', stackOnMobile: false });
    await fixture.whenStable();
    component.changeSettings({ columns: 2 });
    const block = findContentEditorBlock(store.editor.document().blocks, 'grid')!;
    expect((block.content as ContentEditorGridContent).cells).toHaveLength(3);
    expect(contentEditorText((block.content as ContentEditorGridContent).cells[2].blocks[0].content)).toBe('Third');
    expect(block.attrs?.['settings']).toEqual({ columns: 2, gap: 'large', stackOnMobile: false });
    store.editor.undo();
    expect(findContentEditorBlock(store.editor.document().blocks, 'grid')!.attrs?.['settings']).toEqual({ columns: 3, gap: 'large', stackOnMobile: false });
    fixture.componentInstance.duplicateBlock('grid');
    const duplicate = store.editor.document().blocks[1].content as ContentEditorGridContent;
    expect(duplicate.cells[0].id).not.toBe('left');
    expect(duplicate.cells[0].blocks[0].id).not.toBe('left-text');
    await fixture.whenStable();
    const nested: ContentEditorNestedBlocks = fixture.debugElement.query(By.directive(ContentEditorNestedBlocks)).componentInstance;
    nested.insertEmptyBlock(0);
    expect(nested.blocks()).toHaveLength(2);
  });

  it('reorders and removes whole cells with root undo, preserving their block contents', async () => {
    const fixture = await createBuilder(nestedDocument());
    await expect.poll(() => fixture.debugElement.query(By.directive(ContentEditorGridBlock))).toBeTruthy();
    const component: ContentEditorGridBlock = fixture.debugElement.query(By.directive(ContentEditorGridBlock)).componentInstance;
    const editor = fixture.componentInstance.editor;
    component.moveCell(0, 1);
    expect((findContentEditorBlock(editor.document().blocks, 'grid')!.content as ContentEditorGridContent).cells.map(cell => cell.id)).toEqual(['right', 'left']);
    editor.undo();
    component.removeCell('left');
    expect(findContentEditorBlock(editor.document().blocks, 'left-text')).toBeUndefined();
    editor.undo();
    expect(contentEditorText(findContentEditorBlock(editor.document().blocks, 'left-text')!.content)).toBe('Left');
  });

  it('reorders whole cells through CDK pointer dragging without moving their nested blocks separately', async () => {
    const fixture = await createBuilder(nestedDocument());
    fixture.nativeElement.style.width = '400px';
    fixture.nativeElement.style.setProperty('--spacing', '0.25rem');
    await expect.poll(() => fixture.nativeElement.querySelector('.cell-grip')).toBeTruthy();
    fixture.debugElement.query(By.directive(ContentEditorGridBlock)).componentInstance.changeSettings({ stackOnMobile: false });
    await fixture.whenStable();
    const cells: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.grid-cell'));
    const handle = cells[0].querySelector('.cell-grip')!;
    const source = handle.getBoundingClientRect();
    const target = cells[1].getBoundingClientRect();
    const start = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
    const end = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
    let started = 0; let dropped: any = null;
    const drag = fixture.debugElement.queryAll(By.directive(CdkDrag)).find(element => element.nativeElement.getAttribute('data-cell-id') === 'left')!.injector.get(CdkDrag);
    drag.started.subscribe(() => started++); drag.dropped.subscribe(event => dropped = { previous: event.previousIndex, current: event.currentIndex });
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, buttons: 1, detail: 1, clientX: start.x, clientY: start.y }));
    for (const point of [{ x: start.x + 10, y: start.y }, { x: end.x - 10, y: end.y }, end, { x: end.x + 1, y: end.y }]) {
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, buttons: 1, clientX: point.x, clientY: point.y }));
      await fixture.whenStable();
    }
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0, clientX: end.x, clientY: end.y }));
    await fixture.whenStable();
    const editor = fixture.componentInstance.editor;
    expect({ started, dropped }).toEqual({ started: 1, dropped: { previous: 0, current: 1 } });
    await expect.poll(() => (findContentEditorBlock(editor.document().blocks, 'grid')!.content as ContentEditorGridContent).cells.map(cell => cell.id)).toEqual(['right', 'left']);
    expect(contentEditorCollection(editor.document().blocks, { parentId: 'grid', cellId: 'left' })[0].id).toBe('left-text');
    editor.undo();
    expect((findContentEditorBlock(editor.document().blocks, 'grid')!.content as ContentEditorGridContent).cells.map(cell => cell.id)).toEqual(['left', 'right']);
  });

  it('uploads attachment metadata, reports failure and discards a cancelled upload', async () => {
    let resolveUpload: (url: string) => void = () => {};
    const uploadFn = vi.fn(() => new Promise<string>(resolve => { resolveUpload = resolve; }));
    const fixture = await createBuilder({ version: 1, blocks: [
      { id: 'file', type: 'attachment', content: { url: '', name: '', size: 0, mimeType: '' } }
    ] }, { attachment: { uploadFn } });
    await expect.poll(() => fixture.debugElement.query(By.directive(ContentEditorAttachmentBlock))).toBeTruthy();
    const component: ContentEditorAttachmentBlock = fixture.debugElement.query(By.directive(ContentEditorAttachmentBlock)).componentInstance;
    const event = { files: [new File(['hello'], 'hello.txt', { type: 'text/plain' })] } as any;
    const pending = component.upload(event);
    await expect.poll(() => uploadFn.mock.calls.length).toBe(1);
    component.cancelUpload(); resolveUpload('/cancelled.txt'); await pending;
    expect((findContentEditorBlock(fixture.componentInstance.getData().blocks, 'file')!.content as any).url).toBe('');
    uploadFn.mockImplementationOnce(() => Promise.reject(new Error('offline')));
    await component.upload(event);
    expect(component.error()).toContain('Could not upload');
    uploadFn.mockImplementationOnce(() => Promise.resolve('/files/hello.txt'));
    await component.upload(event);
    const saved: any = findContentEditorBlock(fixture.componentInstance.getData().blocks, 'file')!.content;
    expect(saved).toEqual({ url: '/files/hello.txt', name: 'hello.txt', size: 5, mimeType: 'text/plain' });
    fixture.componentInstance.editor.undo();
    expect((findContentEditorBlock(fixture.componentInstance.getData().blocks, 'file')!.content as any).url).toBe('');
  });

  it('edits only the selected slide with plain caption and alt fields and retains it when reordering', async () => {
    const fixture = await createBuilder({ version: 1, blocks: [{ id: 'gallery', type: 'gallery', content: { images: [
      { id: 'one', src: '/one.png', alt: 'First image', caption: [createNgsHeadlessEditorText('First caption')] },
      { id: 'two', src: '/two.png', alt: 'Second image', caption: [createNgsHeadlessEditorText('Second caption')] },
      { id: 'three', src: '/three.png', alt: 'Third image', caption: [] }
    ] } }] });
    await expect.poll(() => fixture.debugElement.query(By.directive(ContentEditorGalleryBlock))).toBeTruthy();
    const gallery = fixture.debugElement.query(By.directive(ContentEditorGalleryBlock));
    const component: ContentEditorGalleryBlock = gallery.componentInstance;
    const store = fixture.debugElement.injector.get(ContentBuilderStore);
    const images = () => (findContentEditorBlock(store.editor.document().blocks, 'gallery')!.content as any).images;
    expect(gallery.nativeElement.querySelectorAll('input[ngsInput]')).toHaveLength(2);
    expect(gallery.nativeElement.querySelector('[contenteditable]')).toBeNull();
    await userEvent.click(gallery.nativeElement.querySelector('button[aria-label="Next image"]'));
    await fixture.whenStable();
    expect(component.selectedId()).toBe('two');
    expect(store.editor.canUndo()).toBe(false);
    const [caption, alt] = gallery.nativeElement.querySelectorAll('input[ngsInput]') as NodeListOf<HTMLInputElement>;
    expect(caption.value).toBe('Second caption');
    expect(alt.value).toBe('Second image');
    caption.value = 'New caption'; caption.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    alt.value = 'New description'; alt.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(contentEditorText(images()[0].caption)).toBe('First caption');
    expect(contentEditorText(images()[1].caption)).toBe('New caption');
    expect(images()[1].caption[0].marks ?? []).toEqual([]);
    expect(images()[1].alt).toBe('New description');
    const list = gallery.query(By.directive(CdkDropList)).injector.get(CdkDropList);
    list.dropped.emit({ previousIndex: 1, currentIndex: 0, container: list, previousContainer: list } as any);
    await fixture.whenStable();
    expect(images().map((image: any) => image.id)).toEqual(['two', 'one', 'three']);
    expect(component.selectedId()).toBe('two');
    expect(component.selectedIndex()).toBe(0);
    store.editor.undo(); await fixture.whenStable();
    expect(images().map((image: any) => image.id)).toEqual(['one', 'two', 'three']);
    expect(component.selectedIndex()).toBe(1);
    component.removeImage('two'); await fixture.whenStable();
    expect(component.selectedId()).toBe('three');
    store.editor.undo(); await fixture.whenStable();
    expect(images()).toHaveLength(3);
    await userEvent.click(gallery.nativeElement.querySelector('button[aria-label="Select image 1"]'));
    await fixture.whenStable();
    expect(component.selectedId()).toBe('one');
    expect(caption.value).toBe('First caption');
  });

  it('replaces an image without losing its caption and discards cancelled or removed replacement targets', async () => {
    let resolveUpload: (src: string) => void = () => {};
    const uploadFn = vi.fn(() => new Promise<string>(resolve => { resolveUpload = resolve; }));
    const fixture = await createBuilder({ version: 1, blocks: [{ id: 'gallery', type: 'gallery', content: { images: [
      { id: 'image', src: '/old.png', alt: 'Keep description', caption: [createNgsHeadlessEditorText('Keep caption')] }
    ] } }] }, { gallery: { uploadFn } });
    await expect.poll(() => fixture.debugElement.query(By.directive(ContentEditorGalleryBlock))).toBeTruthy();
    const component: ContentEditorGalleryBlock = fixture.debugElement.query(By.directive(ContentEditorGalleryBlock)).componentInstance;
    const store = fixture.debugElement.injector.get(ContentBuilderStore);
    const images = () => (findContentEditorBlock(store.editor.document().blocks, 'gallery')!.content as any).images;
    const event = { files: [new File(['image'], 'new.png', { type: 'image/png' })] } as any;
    let pending = component.upload(event, 'image');
    await expect.poll(() => uploadFn.mock.calls.length).toBe(1);
    component.cancelUpload(); resolveUpload('/cancelled.png'); await pending;
    expect(images()[0].src).toBe('/old.png');
    pending = component.upload(event, 'image');
    await expect.poll(() => uploadFn.mock.calls.length).toBe(2);
    resolveUpload('/new.png'); await pending; await fixture.whenStable();
    expect(images()[0].id).toBe('image');
    expect(images()[0].src).toBe('/new.png');
    expect(images()[0].alt).toBe('Keep description');
    expect(contentEditorText(images()[0].caption)).toBe('Keep caption');
    store.editor.undo(); await fixture.whenStable();
    expect(images()[0].src).toBe('/old.png');
    pending = component.upload(event, 'image');
    await expect.poll(() => uploadFn.mock.calls.length).toBe(3);
    component.removeImage('image'); resolveUpload('/removed.png'); await pending; await fixture.whenStable();
    expect(images()).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('ngs-upload-area')).toBeTruthy();
  });

  it('keeps successful gallery uploads in selection order and preserves captions when reordering', async () => {
    const uploadFn = vi.fn((file: File) => file.name === 'bad.png' ? Promise.reject(new Error('offline')) : Promise.resolve('/' + file.name));
    const fixture = await createBuilder({ version: 1, blocks: [
      { id: 'gallery', type: 'gallery', content: { images: [] } }
    ] }, { gallery: { uploadFn } });
    await expect.poll(() => fixture.debugElement.query(By.directive(ContentEditorGalleryBlock))).toBeTruthy();
    const component: ContentEditorGalleryBlock = fixture.debugElement.query(By.directive(ContentEditorGalleryBlock)).componentInstance;
    await component.upload({ files: ['first.png', 'bad.png', 'last.png'].map(name => new File(['image'], name, { type: 'image/png' })) } as any);
    const store = fixture.debugElement.injector.get(ContentBuilderStore);
    const images = () => (findContentEditorBlock(store.editor.document().blocks, 'gallery')!.content as any).images;
    expect(images().map((image: any) => image.src)).toEqual(['/first.png', '/last.png']);
    await fixture.whenStable();
    const gallery: HTMLElement = fixture.nativeElement.querySelector('ngs-content-editor-gallery-block');
    expect(gallery.querySelectorAll('[data-image-id]')).toHaveLength(2);
    expect(gallery.querySelectorAll('input[ngsInput]')).toHaveLength(2);
    expect(gallery.querySelector('button[aria-label="Next image"]')).toBeTruthy();
    expect(Array.from(gallery.querySelectorAll('button')).some(button => ['Grid', 'Carousel', '2 columns', '3 columns'].includes(button.textContent!.trim()))).toBe(false);
    expect(component.error()).toContain('Some images');
    component.changeCaption(images()[0].id, 'Caption');
    component.moveImage(0, 1);
    expect(contentEditorText(images()[1].caption)).toBe('Caption');
    component.removeImage(images()[0].id);
    expect(images()).toHaveLength(1);
    store.editor.undo();
    expect(images()).toHaveLength(2);
  });
});
