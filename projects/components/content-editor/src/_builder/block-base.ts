import { Directive, ElementRef, effect, inject, input, signal, untracked } from '@angular/core';
import { ContentBuilderStore } from '../content-builder.store';
import { ContentBuilderComponent } from '../content-builder/content-builder.component';
import { CONTENT_BUILDER, ContentEditorDataBlock, ContentEditorItemProperty } from '../types';
import { contentEditorBlockView, findContentEditorBlock, isContentEditorBlockEmpty } from '../document';

/** Shared native inputs and root history for the built-in block editors. */
@Directive()
export abstract class ContentEditorBlockBase<T, S extends object = Record<string, unknown>> implements ContentEditorDataBlock {
  protected readonly store = inject(ContentBuilderStore);
  protected readonly builder = inject<ContentBuilderComponent>(CONTENT_BUILDER);
  protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly id = input.required<string>();
  readonly content = input.required<T>();
  readonly settings = input.required<S>();
  readonly index = input(0);
  readonly props = input<ContentEditorItemProperty[]>([]);
  readonly initialized = signal(true);

  constructor() {
    effect(() => {
      if (this.store.focusedBlockId() === this.id()) untracked(() => this.focus());
    });
  }
  focus(): void { this.element.querySelector<HTMLElement>('[contenteditable="true"], input, button')?.focus(); }
  getData() { return { content: this.content(), settings: this.settings(), props: this.props() }; }
  isEmpty(): boolean {
    const block = findContentEditorBlock(this.store.editor.document().blocks, this.id());
    return !block || isContentEditorBlockEmpty(block);
  }
  protected save(content: T, settings: S = this.settings()): void { this.store.updateBlock(this.id(), { content, settings }); }
  protected latestContent(): T {
    const block = findContentEditorBlock(this.store.editor.document().blocks, this.id());
    return block ? contentEditorBlockView(block).content : this.content();
  }
}
