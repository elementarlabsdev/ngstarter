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
import '../../../../../node_modules/@angular/cdk/overlay-prebuilt.css';

const paragraph = (id: string, text: string) => ({ id, type: 'paragraph', content: [createNgsHeadlessEditorText(text)] });
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
