import type { CDPSession } from '@vitest/browser-playwright';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { userEvent, cdp, page } from 'vitest/browser';
import { ContentBuilderComponent } from './content-builder.component';
import { ContentEditorContentEditableDirective } from '../content-editor-content-editable.directive';
import { ContentEditorNestedBlocks } from '../_builder/nested-blocks/nested-blocks';
import { findContentEditorBlock, contentEditorCollection } from '../document';
import { ContentBuilderStore } from '../content-builder.store';
import { createNgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { MenuTrigger } from '@ngstarter-ui/components/menu';
import { ImageBlockComponent } from '../_builder/image-block/image-block.component';
import { VideoBlockComponent } from '../_builder/video-block/video-block.component';
import { ContentEditorListItem, ContentEditorTableAttributes } from '../types';
import '../../../../../node_modules/@angular/cdk/overlay-prebuilt.css';

const paragraph = (id: string, text: string) => ({ id, type: 'paragraph', content: [createNgsHeadlessEditorText(text)] });
const listItem = (text: string, children: ContentEditorListItem[] = []): ContentEditorListItem => ({
  content: [createNgsHeadlessEditorText(text)], props: [], children,
});
async function create(options = {}) {
  await page.viewport(1100, 900);
  TestBed.configureTestingModule({ imports: [ContentBuilderComponent] });
  const fixture = TestBed.createComponent(ContentBuilderComponent);
  fixture.componentRef.setInput('persistDraft', false); fixture.componentRef.setInput('options', options);
  fixture.componentRef.setInput('content', { version: 1, blocks: [
    { id: 'grid', type: 'grid', content: { cells: [{ id: 'left', blocks: [paragraph('left-text', 'Hello world')] }, { id: 'right', blocks: [paragraph('right-text', 'Right')] }] } },
    paragraph('footer', 'Footer')
  ] });
  document.body.style.setProperty('--ngs-button-height', '32px');
  fixture.nativeElement.style.display = 'block';
  fixture.nativeElement.style.width = '900px'; fixture.nativeElement.style.padding = '60px';
  fixture.nativeElement.style.setProperty('--spacing', '0.25rem');
  fixture.autoDetectChanges(); await fixture.whenStable();
  await expect.poll(() => fixture.nativeElement.querySelector('[data-block-id="left-text"] [contenteditable]')).toBeTruthy();
  return fixture;
}
function selectedRegion(fixture: any) {
  const element = fixture.debugElement.queryAll(By.directive(ContentEditorContentEditableDirective)).find((item: any) => item.nativeElement.closest('[data-block-id="left-text"]'))!;
  const region = element.injector.get(ContentEditorContentEditableDirective) as ContentEditorContentEditableDirective;
  region.region.editor.setSelection({ anchor: { blockId: 'line-0', offset: 0 }, focus: { blockId: 'line-0', offset: 5 } });
  region.focus(); element.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  return { region, surface: element.nativeElement as HTMLElement };
}

describe('Content editor user workflows in Chromium', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('keeps focus and scroll position when a document loads a list below the viewport', async () => {
    const fixture = await create();
    const host = fixture.nativeElement as HTMLElement;
    host.style.height = '250px';
    host.style.overflowY = 'auto';
    const surface = host.querySelector<HTMLElement>('[data-block-id="left-text"] [contenteditable]')!;
    surface.focus({ preventScroll: true });
    host.scrollTop = 0;

    const { blocks } = fixture.componentInstance.getData();
    fixture.componentRef.setInput('content', { version: 1, blocks: [
      ...blocks,
      ...Array.from({ length: 20 }, (_, index) => paragraph(`line-${index}`, `Line ${index}`)),
      { id: 'code', type: 'code', content: [createNgsHeadlessEditorText('const n = 1;')], attrs: { settings: { language: 'javascript' } } },
      { id: 'list', type: 'bulletList', content: [listItem('First', [listItem('Nested')]), listItem('Last')], attrs: { settings: { listStyle: 'bullet' } } },
    ] });
    await expect.poll(() => host.querySelectorAll('ngs-list-block [contenteditable]').length).toBe(3);
    await expect.poll(() => host.querySelector('.cm-content')?.textContent).toBe('const n = 1;');
    await new Promise(requestAnimationFrame);

    expect(host.scrollTop).toBe(0);
    expect(document.activeElement).toBe(surface);
    expect(host.querySelector('ngs-list-block')!.getBoundingClientRect().top).toBeGreaterThan(host.getBoundingClientRect().bottom);
  });

  it('moves focus to the edited list item when Enter or Tab changes the list', async () => {
    const fixture = await create();
    const { id } = fixture.componentInstance.insertBlock('bulletList', 0, {}, true, [listItem('First'), listItem('Last')]);
    const host = fixture.nativeElement as HTMLElement;
    const items = () => [...host.querySelectorAll<HTMLElement>(`[data-block-id="${id}"] .list-item-content`)];
    await expect.poll(() => document.activeElement === items()[0]).toBe(true);

    await userEvent.keyboard('{Enter}');
    await expect.poll(() => items().map(item => item.textContent)).toEqual(['First', '', 'Last']);
    expect(document.activeElement).toBe(items()[1]);
    await userEvent.keyboard('Middle');
    await expect.poll(() => items()[1].textContent).toBe('Middle');

    const nested = () => host.querySelector(`[data-block-id="${id}"] ol .list-item-content`);
    await userEvent.keyboard('{Tab}');
    await expect.poll(() => nested()?.textContent).toBe('Middle');
    expect(document.activeElement).toBe(nested());

    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await expect.poll(nested).toBeNull();
    expect(items()[1].textContent).toBe('Middle');
    expect(document.activeElement).toBe(items()[1]);
  });

  it('fits the table by default and preserves manual column widths across mode changes', async () => {
    const fixture = await create();
    const builder = fixture.componentInstance;
    const { id } = builder.insertBlock('table', 0, {}, false);
    const attributes = () => findContentEditorBlock(builder.getData().blocks, id)?.attrs as Partial<ContentEditorTableAttributes> | undefined;
    const columnWidth = () => attributes()?.cellMetadata?.[0]?.[0]?.options?.width;
    const host = fixture.nativeElement as HTMLElement;
    const tableBlock = () => host.querySelector<HTMLElement>(`[data-block-id="${id}"]`)!;
    const table = () => tableBlock().querySelector('table')!;
    const changeWidthMode = async (label: string) => {
      tableBlock().querySelector<HTMLButtonElement>('button[cdkDragHandle]')!.click();
      const action = () => [...document.querySelectorAll<HTMLButtonElement>('button[ngs-list-item]')]
        .find(button => button.textContent?.trim() === label)!;
      await expect.poll(action).toBeTruthy();
      const button = action();
      button.click();
      await fixture.whenStable();
      await expect.poll(() => button.isConnected).toBe(false);
    };
    const dragColumn = () => {
      const cell = table().rows[0].cells[0];
      const clientX = cell.getBoundingClientRect().right;
      const clientY = cell.getBoundingClientRect().top + 10;
      cell.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX, clientY }));
      cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX, clientY }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: clientX + 50, clientY }));
      document.dispatchEvent(new MouseEvent('mouseup'));
    };
    await expect.poll(table).toBeTruthy();
    const fullWidth = table().getBoundingClientRect().width;
    expect(fullWidth).toBeGreaterThan(500);
    expect(table().rows[0].cells[0].getBoundingClientRect().width).toBeCloseTo(fullWidth / 3, 0);
    dragColumn();
    expect(columnWidth()).toBeUndefined();

    await changeWidthMode('Use manual column widths');
    expect(attributes()?.settings?.fullWidth).toBe(false);
    expect(table().getBoundingClientRect().width).toBeLessThan(fullWidth);
    const originalWidth = table().rows[0].cells[0].getBoundingClientRect().width;
    dragColumn();
    await fixture.whenStable();
    const savedWidth = Number(columnWidth());
    expect(savedWidth).toBeGreaterThan(originalWidth + 40);

    await changeWidthMode('Fit to full width');
    expect(table().getBoundingClientRect().width).toBeCloseTo(fullWidth, 0);
    expect(columnWidth()).toBe(savedWidth);
    builder.editor.undo();
    await fixture.whenStable();
    expect(attributes()?.settings?.fullWidth).toBe(false);
    expect(table().rows[0].cells[0].getBoundingClientRect().width).toBeCloseTo(savedWidth, 0);

    await changeWidthMode('Fit to full width');
    const columnHandle = tableBlock().querySelector('.resize-end')!;
    const edge = columnHandle.getBoundingClientRect().right;
    columnHandle.dispatchEvent(new MouseEvent('mousedown'));
    for (const distance of [100, 200, 200]) {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: edge + distance }));
      await fixture.whenStable();
    }
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(table().rows[0].cells).toHaveLength(5);
    expect(table().getBoundingClientRect().width).toBeCloseTo(fullWidth, 0);
  });

  it('selects nested text, edits a link in an actual dialog, then restores both document and DOM with Undo/Redo', async () => {
    const fixture = await create(); const { surface } = selectedRegion(fixture);
    await expect.poll(() => document.querySelector('ngs-command-bar')).toBeTruthy();
    const link = document.querySelectorAll<HTMLElement>('ngs-command-bar button[ngsIconButton]')[7];
    await userEvent.click(link); await fixture.whenStable();
    await userEvent.fill(document.querySelector('ngs-add-link input')!, 'https://example.com');
    await userEvent.tab();
    const add = [...document.querySelectorAll<HTMLButtonElement>('ngs-add-link button')].find(button => button.textContent?.trim() === 'Add')!;
    await userEvent.click(add); await fixture.whenStable();
    expect(surface.querySelector('a')?.textContent).toBe('Hello'); expect(document.getSelection()?.toString()).toBe('Hello');
    expect((findContentEditorBlock(fixture.componentInstance.getData().blocks, 'left-text')!.content as any)[0].marks[0].type).toBe('link');
    fixture.componentInstance.editor.undo(); await fixture.whenStable(); expect(surface.querySelector('a')).toBeNull();
    fixture.componentInstance.editor.redo(); await fixture.whenStable(); expect(surface.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
  });

  it('chooses a color in an actual overlay and undoes the nested edit', async () => {
    const fixture = await create(); const { surface } = selectedRegion(fixture);
    await expect.poll(() => document.querySelector('ngs-command-bar')).toBeTruthy();
    await userEvent.click(document.querySelectorAll<HTMLElement>('ngs-command-bar button[ngsIconButton]')[9]);
    await fixture.whenStable();
    const color = [...document.querySelectorAll<HTMLElement>('ngs-text-color button')].find(button => button.style.color === 'rgb(127, 127, 127)')!; color.focus(); await userEvent.click(color); await fixture.whenStable();
    expect((findContentEditorBlock(fixture.componentInstance.getData().blocks, 'left-text')!.content as any)[0].marks[0].type).toBe('textColor');
    expect(document.getSelection()?.toString()).toBe('Hello');
    fixture.componentInstance.editor.undo(); await fixture.whenStable(); expect(surface.textContent).toBe('Hello world'); expect(surface.querySelector('[data-ngs-headless-editor-mark="textColor"]')).toBeNull();
  });

  it('inserts HTML at the active nested block and restores all blocks with a single Undo', async () => {
    const fixture = await create(); selectedRegion(fixture);
    const builder = fixture.componentInstance; const before = builder.getData();
    expect(builder.getInsertionTarget()).toEqual({ scope: { parentId: 'grid', cellId: 'left' }, afterId: 'left-text' });
    builder.importHtml('<h2>Imported</h2><p><b>Body</b></p>', {}, { mode: 'insert' }); await fixture.whenStable();
    expect(contentEditorCollection(builder.getData().blocks, { parentId: 'grid', cellId: 'left' }).map(block => block.type)).toEqual(['paragraph', 'heading', 'paragraph']);
    builder.editor.undo(); await fixture.whenStable(); expect(builder.getData()).toEqual(before);
  });

  it('converts nested blocks through the shared menu and preserves their selection', async () => {
    const fixture = await create(); const { region, surface } = selectedRegion(fixture);
    const range = document.createRange(); range.selectNodeContents(surface); range.collapse(true);
    document.getSelection()?.removeAllRanges(); document.getSelection()?.addRange(range); document.dispatchEvent(new Event('selectionchange'));
    await fixture.whenStable();
    region.region.editor.setSelection({ anchor: { blockId: 'line-0', offset: 0 }, focus: { blockId: 'line-0', offset: 5 } });
    const nested = fixture.debugElement.queryAll(By.directive(ContentEditorNestedBlocks)).find(element => element.componentInstance.scope().cellId === 'left')!;
    const handle = nested.nativeElement.querySelector('[cdkDragHandle]') as HTMLElement;
    handle.focus(); await userEvent.keyboard('{Enter}'); await fixture.whenStable();
    const turnInto = [...document.querySelectorAll<HTMLElement>('button[ngs-menu-item]')].find(button => button.textContent?.trim() === 'Turn into')!;
    await userEvent.click(turnInto); await fixture.whenStable();
    const callout = [...document.querySelectorAll<HTMLElement>('button[ngs-menu-item]')].find(button => button.textContent?.trim() === 'callout')!;
    await userEvent.click(callout); await fixture.whenStable();
    await expect.poll(() => findContentEditorBlock(fixture.componentInstance.getData().blocks, 'left-text')?.type).toBe('callout');
    await expect.poll(() => document.getSelection()?.toString()).toBe('Hello');
    fixture.componentInstance.editor.undo(); await fixture.whenStable();
    expect(findContentEditorBlock(fixture.componentInstance.getData().blocks, 'left-text')?.type).toBe('paragraph');
  });

  it('drags a block between grid cells using the CDK handle and undoes the move', async () => {
    const fixture = await create(); const builder = fixture.componentInstance; const before = builder.getData();
    const source = fixture.nativeElement.querySelector('[data-block-id="left-text"] [cdkDragHandle]') as HTMLElement;
    const target = fixture.nativeElement.querySelectorAll('ngs-content-editor-nested-blocks .cdk-drop-list')[1] as HTMLElement;
    await userEvent.hover(fixture.nativeElement.querySelector('[data-block-id="left-text"]'));
    const origin = source.getBoundingClientRect(); const destination = target.getBoundingClientRect();
    const frameNode = window.frameElement as HTMLElement | null;
    const frame = frameNode?.getBoundingClientRect();
    const scaleX = frame && frameNode ? frame.width / frameNode.clientWidth : 1;
    const scaleY = frame && frameNode ? frame.height / frameNode.clientHeight : 1;
    const offsetX = frame?.left ?? 0; const offsetY = frame?.top ?? 0;
    const start = { x: (origin.left + origin.width / 2) * scaleX + offsetX, y: (origin.top + origin.height / 2) * scaleY + offsetY };
    const end = { x: (destination.left + 100) * scaleX + offsetX, y: (destination.top + 30) * scaleY + offsetY };
    const mouse = cdp() as CDPSession;
    await mouse.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...start });
    await mouse.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', buttons: 1, clickCount: 1, ...start });
    for (let step = 1; step <= 15; step++) {
      await mouse.send('Input.dispatchMouseEvent', { type: 'mouseMoved', buttons: 1, x: start.x + (end.x - start.x) * step / 15, y: start.y + (end.y - start.y) * step / 15 });
    }
    await mouse.send('Input.dispatchMouseEvent', { type: 'mouseMoved', buttons: 1, ...end });
    await mouse.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', buttons: 0, clickCount: 1, ...end });
    await fixture.whenStable();
    await expect.poll(() => contentEditorCollection(builder.getData().blocks, { parentId: 'grid', cellId: 'right' }).map(block => block.id)).toContain('left-text');
    expect(contentEditorCollection(builder.getData().blocks, { parentId: 'grid', cellId: 'left' })).toHaveLength(0);
    builder.editor.undo(); await fixture.whenStable(); expect(builder.getData()).toEqual(before);
  });

  it('filters the shared block menu and inserts with Enter into the triggering grid cell', async () => {
    const fixture = await create(); const builder = fixture.componentInstance;
    const nested = fixture.debugElement.queryAll(By.directive(ContentEditorNestedBlocks)).find(item => item.componentInstance.scope().cellId === 'left')!;
    const add = nested.nativeElement.querySelector('[aria-label="Add block"]') as HTMLElement;
    add.focus(); await userEvent.keyboard('{Enter}'); await fixture.whenStable();
    const search = document.querySelector<HTMLInputElement>('input[aria-label="Search blocks"]')!;
    await userEvent.fill(search, 'callout'); await fixture.whenStable();
    expect([...document.querySelectorAll('button[ngs-menu-item]')].map(item => item.textContent)).toHaveLength(1);
    await userEvent.keyboard('{ArrowDown}'); await fixture.whenStable();
    expect(document.activeElement?.matches('button[ngs-menu-item]')).toBe(true);
    await userEvent.keyboard('{Enter}'); await fixture.whenStable();
    expect(contentEditorCollection(builder.getData().blocks, { parentId: 'grid', cellId: 'left' }).map(block => block.type)).toEqual(['paragraph', 'callout']);
    expect(builder.menuQuery()).toBe('');
    builder.editor.undo(); await fixture.whenStable();
    expect(contentEditorCollection(builder.getData().blocks, { parentId: 'grid', cellId: 'left' })).toHaveLength(1);
  });

  it('inherits local toolbar theme tokens and follows changes while the overlay is open', async () => {
    const fixture = await create();
    fixture.nativeElement.style.setProperty('--ngs-content-editor-toolbar-bg', '#112233');
    fixture.nativeElement.style.setProperty('--ngs-content-editor-toolbar-color', '#ffffff');
    selectedRegion(fixture); await fixture.whenStable();
    await expect.poll(() => document.querySelector('ngs-command-bar')).toBeTruthy();
    const toolbar = document.querySelector('ngs-command-bar') as HTMLElement;
    expect(getComputedStyle(toolbar).backgroundColor).toBe('rgb(17, 34, 51)');
    fixture.nativeElement.style.setProperty('--ngs-content-editor-toolbar-bg', '#eeeeee');
    fixture.nativeElement.style.setProperty('--ngs-content-editor-toolbar-color', '#111111');
    await expect.poll(() => getComputedStyle(toolbar).backgroundColor).toBe('rgb(238, 238, 238)');
    expect(getComputedStyle(toolbar).color).toBe('rgb(17, 17, 17)');
  });

  it('deletes a group in one history step', async () => {
    const fixture = await create(); const before = fixture.componentInstance.getData();
    const store = fixture.debugElement.injector.get(ContentBuilderStore);
    store.deleteBlocks(['grid', 'footer']); await fixture.whenStable();
    expect(fixture.componentInstance.getData().blocks.some(block => block.id === 'grid' || block.id === 'footer')).toBe(false);
    fixture.componentInstance.editor.undo(); await fixture.whenStable(); expect(fixture.componentInstance.getData()).toEqual(before);
  });

  it.each(['image', 'video'] as const)('retries %s uploads through the actual status UI', async type => {
    const uploadFn = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValue('/uploaded.' + (type === 'image' ? 'png' : 'mp4'));
    const fixture = await create({ [type]: { uploadFn } });
    const block = fixture.componentInstance.insertBlock(type, 0, {}, false); await fixture.whenStable();
    await expect.poll(() => fixture.nativeElement.querySelector(type === 'image' ? 'ngs-image-block' : 'ngs-video-block')).toBeTruthy();
    const element = fixture.debugElement.query(By.directive(type === 'image' ? ImageBlockComponent : VideoBlockComponent));
    await (element.componentInstance as any).onFileSelected({ files: [new File(['file'], 'media', { type: type + '/' + (type === 'image' ? 'png' : 'mp4') })] }); await fixture.whenStable();
    const retry = [...element.nativeElement.querySelectorAll('button')].find((button: any) => button.textContent.includes('Retry upload')) as HTMLElement;
    expect(retry).toBeTruthy(); await userEvent.click(retry);
    await expect.poll(() => (findContentEditorBlock(fixture.componentInstance.getData().blocks, block.id)!.content as any).src).toContain('/uploaded.');
    expect(uploadFn).toHaveBeenCalledTimes(2); expect(uploadFn.mock.calls[1][2].signal).toBeInstanceOf(AbortSignal);
  });
});
