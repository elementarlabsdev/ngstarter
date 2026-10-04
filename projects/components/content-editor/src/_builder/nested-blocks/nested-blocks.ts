import { AsyncPipe, DOCUMENT, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, afterNextRender, computed, effect, forwardRef, inject, input, signal, viewChild } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { ContentBuilderComponent } from '../../content-builder/content-builder.component';
import { ContentBuilderStore } from '../../content-builder.store';
import { CONTENT_BUILDER, ContentEditorBlockScope, ContentEditorBlockView } from '../../types';
import { cloneContentEditorValue, contentEditorBlockView, contentEditorCollection, contentEditorChildCollections, findContentEditorBlock } from '../../document';
import { createNgsHeadlessEditorId } from '@ngstarter-ui/components/headless-editor';

@Component({
  selector: 'ngs-content-editor-nested-blocks',
  imports: [AsyncPipe, NgComponentOutlet, CdkDrag, CdkDragHandle, CdkDropList, Button, Icon, Menu, MenuItem, MenuTrigger],
  providers: [{ provide: CONTENT_BUILDER, useExisting: forwardRef(() => ContentEditorNestedBlocks) }],
  templateUrl: './nested-blocks.html', styleUrl: './nested-blocks.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown)': 'onKeyDown($event)' }
})
export class ContentEditorNestedBlocks {
  private readonly parent = inject<ContentBuilderComponent>(CONTENT_BUILDER, { skipSelf: true });
  private readonly store = inject(ContentBuilderStore);
  private readonly document = inject(DOCUMENT);
  private readonly dropList = viewChild.required(CdkDropList);
  readonly connectedDropLists = this.store.dropLists;
  readonly scope = input.required<ContentEditorBlockScope>();
  readonly emptyBlock = signal(this.rootBuilder.createBlockView('paragraph'));
  readonly focusChanged = new EventEmitter<void>();
  constructor() {
    effect(() => {
      if (this.blocks().some(block => block.id === this.emptyBlock().id)) this.emptyBlock.set(this.rootBuilder.createBlockView('paragraph'));
    });
    let registered: CdkDropList<ContentEditorBlockScope> | null = null;
    afterNextRender(() => { registered = this.dropList(); this.store.registerDropList(registered); });
    inject(DestroyRef).onDestroy(() => { if (registered) this.store.unregisterDropList(registered); });
  }
  get rootBuilder(): ContentBuilderComponent { return this.parent.rootBuilder; }
  readonly blocks = computed(() => contentEditorCollection(this.store.editor.document().blocks, this.scope()).map(contentEditorBlockView));
  readonly renderedBlocks = computed(() => {
    const blocks = this.blocks();
    return blocks.length ? blocks : [this.emptyBlock()];
  });
  getBlockComponent(type: string): any { return this.rootBuilder.getBlockComponent(type); }
  getBlockDefOption(type: string, key: string): any { return this.rootBuilder.getBlockDefOption(type, key); }
  emitContentChangeEvent(): void {}
  focusBlock(id: string | null): void { this.store.setFocusedBlockId(id); this.focusChanged.emit(); }
  insertEmptyBlock(index: number): void { this.addBlock('paragraph', {}, index + 1); }
  updateParagraph(id: string, data: Partial<ContentEditorBlockView>): void {
    if (this.blocks().some(block => block.id === id)) this.store.updateBlock(id, data);
    else if (id === this.emptyBlock().id) this.store.addBlock({ ...this.emptyBlock(), ...data }, this.blocks().length, this.scope());
  }
  addBlock(type: string, settings = {}, index = this.blocks().length): void {
    const block = this.rootBuilder.createBlockView(type, settings);
    this.store.addBlock(block, index, this.scope());
    this.focusBlock(block.id);
  }
  deleteBlock(id: string): void {
    const index = this.blocks().findIndex(block => block.id === id);
    if (index < 0) return;
    this.store.deleteBlock(id, index);
    this.focusBlock(this.blocks()[Math.max(0, index - 1)]?.id ?? null);
  }
  duplicateBlock(id: string): void {
    const index = this.blocks().findIndex(block => block.id === id);
    if (index < 0) return;
    const block = cloneContentEditorValue(this.blocks()[index]);
    const reidentify = (item: any) => {
      item.id = createNgsHeadlessEditorId(item.type);
      for (const children of contentEditorChildCollections(item)) for (const child of children) reidentify(child);
      if (item.type === 'grid') for (const cell of item.content.cells) cell.id = createNgsHeadlessEditorId('cell');
      if (item.type === 'gallery') for (const image of item.content.images) image.id = createNgsHeadlessEditorId('image');
    };
    reidentify(block);
    this.store.addBlock(block, index + 1, this.scope());
  }
  drop(event: CdkDragDrop<ContentEditorBlockScope>): void {
    this.store.moveBetweenCollections(event.previousIndex, event.currentIndex, event.previousContainer.data, event.container.data);
  }
  onDragStarted(): void { this.store.setDragging(true); }
  onDragEnded(): void { this.store.setDragging(false); }
  readonly canEnter = (drag: CdkDrag<string>, drop: CdkDropList<ContentEditorBlockScope>): boolean => {
    const pointer = this.store.dragPointer();
    const nearest = pointer ? this.document.elementFromPoint(pointer.x, pointer.y)?.closest('.cdk-drop-list') : null;
    if (nearest && nearest.id !== drop.id) return false;
    const parentId = drop.data.parentId;
    const block = findContentEditorBlock(this.store.editor.document().blocks, drag.data);
    return !parentId || !block || !findContentEditorBlock([block], parentId);
  };
  onKeyDown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    if ((event.ctrlKey || event.metaKey) && ['z', 'y'].includes(event.key.toLowerCase())) {
      const redo = event.key.toLowerCase() === 'y' || event.shiftKey;
      if (redo ? this.store.editor.redo() : this.store.editor.undo()) event.preventDefault();
      event.stopPropagation();
    }
  }
}
