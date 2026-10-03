import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { NgsHeadlessEditor, NgsHeadlessEditorChangeOrigin } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorBlockScope, ContentEditorBlockView, ContentEditorDocument } from './types';
import { cloneContentEditorValue, contentEditorBlockView, contentEditorNativeBlock, contentEditorCollection, findContentEditorBlock, replaceContentEditorCollection, contentEditorChildCollections } from './document';

/** UI state and block operations. The headless document is the only content store. */
@Injectable()
export class ContentBuilderStore {
  readonly editor = inject(NgsHeadlessEditor);
  private dragging = false;
  constructor() {
    const document = inject(DOCUMENT);
    // Capture the current point before CDK chooses a connected list. Its moved
    // output is emitted after hit testing and would provide the previous point.
    const mouse = (event: MouseEvent) => { if (this.dragging) this.dragPointer.set({ x: event.clientX, y: event.clientY }); };
    const touch = (event: TouchEvent) => {
      const point = event.touches[0];
      if (this.dragging && point) this.dragPointer.set({ x: point.clientX, y: point.clientY });
    };
    document.addEventListener('mousemove', mouse, true);
    document.addEventListener('touchmove', touch, { capture: true, passive: true });
    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener('mousemove', mouse, true);
      document.removeEventListener('touchmove', touch, true);
    });
  }
  private textEdit: { origin: NgsHeadlessEditorChangeOrigin; group: string } | null = null;

  /** Scopes typing groups to one text region, so adjacent cells never share undo. */
  withTextEdit(origin: NgsHeadlessEditorChangeOrigin, group: string, edit: () => void): void {
    const previous = this.textEdit;
    this.textEdit = { origin, group };
    try { edit(); } finally { this.textEdit = previous; }
  }
  readonly focusedBlockId = signal<string | null>(null);
  readonly activeBlockId = signal<string | null>(null);
  readonly dragPointer = signal<{ x: number; y: number } | null>(null);
  setDragging(dragging: boolean): void {
    this.dragging = dragging;
    if (!dragging) this.dragPointer.set(null);
  }
  readonly dropLists = signal<CdkDropList<ContentEditorBlockScope>[]>([]);
  registerDropList(list: CdkDropList<ContentEditorBlockScope>): void {
    if (!this.dropLists().includes(list)) this.dropLists.update(lists => [...lists, list]);
  }
  unregisterDropList(list: CdkDropList<ContentEditorBlockScope>): void {
    this.dropLists.update(lists => lists.filter(item => item !== list));
  }
  readonly blocks = computed(() => this.editor.document().blocks.map(contentEditorBlockView));

  setFocusedBlockId(id: string | null): void { this.focusedBlockId.set(id); }
  setActiveBlockId(id: string | null): void { this.activeBlockId.set(id); }
  setBlocks(value: ContentEditorDocument): void {
    this.editor.setDocument(value);
  }
  addBlock(block: ContentEditorBlockView, index: number, scope: ContentEditorBlockScope = {}): void {
    const native = contentEditorNativeBlock(block);
    const blocks = cloneContentEditorValue([...this.editor.document().blocks]);
    const collection = [...contentEditorCollection(blocks, scope)];
    collection.splice(index, 0, native);
    replaceContentEditorCollection(blocks, scope, collection);
    this.editor.updateDocument({ version: 1, blocks });
  }
  deleteBlock(id: string, _index: number): void {
    const blocks = cloneContentEditorValue([...this.editor.document().blocks]);
    const remove = (items: any[]): boolean => {
      const index = items.findIndex(block => block.id === id);
      if (index !== -1) { items.splice(index, 1); return true; }
      return items.some(block => contentEditorChildCollections(block).some(children => remove(children as any[])));
    };
    if (remove(blocks)) this.editor.updateDocument({ version: 1, blocks });
  }
  updateBlock(id: string, data: Partial<ContentEditorBlockView>): void {
    const blocks = cloneContentEditorValue([...this.editor.document().blocks]);
    const previous = findContentEditorBlock(blocks, id);
    if (!previous) return;
    const next = contentEditorNativeBlock({ ...contentEditorBlockView(previous), ...data });
    const origin = this.textEdit?.origin ?? 'command';
    const typing = origin === 'keyboard' || origin === 'composition';
    const root = blocks.find(block => !!findContentEditorBlock([block], id))!;
    Object.assign(previous, next);
    this.editor.updateBlock(root.id, { content: root.content, attrs: root.attrs },
      typing ? origin : 'command', typing ? this.textEdit?.group ?? null : null);
  }
  moveBlock(from: number, to: number): void {
    const blocks = [...this.editor.document().blocks];
    const [block] = blocks.splice(from, 1);
    blocks.splice(to, 0, block);
    this.editor.updateDocument({ version: 1, blocks });
  }
  moveBetweenCollections(from: number, to: number, source: ContentEditorBlockScope, target: ContentEditorBlockScope): void {
    const blocks = cloneContentEditorValue([...this.editor.document().blocks]);
    const sourceItems = [...contentEditorCollection(blocks, source)];
    const block = sourceItems[from];
    if (!block || (target.parentId && findContentEditorBlock([block], target.parentId))) return;
    sourceItems.splice(from, 1);
    replaceContentEditorCollection(blocks, source, sourceItems);
    const targetItems = [...contentEditorCollection(blocks, target)];
    targetItems.splice(to, 0, block);
    replaceContentEditorCollection(blocks, target, targetItems);
    this.editor.updateDocument({ version: 1, blocks });
  }
}
