import {
  afterNextRender, afterRenderEffect, Directive, effect, ElementRef, inject, input, OnDestroy, output, untracked
} from '@angular/core';
import {
  NgsHeadlessEditorInlineRegion, NgsHeadlessEditorSurface,
  NgsHeadlessEditorText, provideNgsHeadlessEditorInlineRegion
} from '@ngstarter-ui/components/headless-editor';
import { ContentEditorImporter } from './import/content-importer';
import { contentEditorImportedText } from './import/inline-content';
import { CONTENT_BUILDER } from './types';
import type { ContentBuilderComponent } from './content-builder/content-builder.component';
import { ContentBuilderStore } from './content-builder.store';
import { createNgsHeadlessEditorId } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorItemProperty, ContentEditorText } from './types';

const regions = new WeakMap<HTMLElement, ContentEditorContentEditableDirective>();

/** A headless inline editor bound to a text field in a content block. */
@Directive({
  selector: '[ngsContentEditorContentEditable]',
  exportAs: 'ngsContentEditorContentEditable',
  providers: [provideNgsHeadlessEditorInlineRegion()],
  hostDirectives: [NgsHeadlessEditorSurface],
  host: {
    'class': 'ngs-content-editor-content-editable',
    '[class.align-left]': 'alignment() === "left"',
    '[class.align-center]': 'alignment() === "center"',
    '[class.align-right]': 'alignment() === "right"',
    '[class.align-justify]': 'alignment() === "justify"',
    '(focus)': 'activate()'
  }
})
export class ContentEditorContentEditableDirective implements OnDestroy {
  readonly region = inject(NgsHeadlessEditorInlineRegion);
  private readonly surface = inject(NgsHeadlessEditorSurface);
  private readonly importer = inject(ContentEditorImporter);
  private readonly builder = inject<ContentBuilderComponent>(CONTENT_BUILDER, { optional: true });
  private readonly store = inject(ContentBuilderStore, { optional: true });
  private readonly historyGroup = createNgsHeadlessEditorId('content-region');
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly content = input<ContentEditorText>([], { alias: 'ngsContentEditorContentEditable' });
  readonly settings = input<unknown>({});
  readonly props = input<ContentEditorItemProperty[]>([]);
  readonly singleLine = input(false);
  readonly contentChanged = output<readonly NgsHeadlessEditorText[]>();
  readonly propsChanged = output<ContentEditorItemProperty[]>();
  readonly pressedEnter = output<KeyboardEvent>();
  readonly initialized = output<void>();

  static forElement(element: HTMLElement | null): ContentEditorContentEditableDirective | undefined {
    return element ? regions.get(element) : undefined;
  }

  constructor() {
    regions.set(this.element, this);
    effect(() => {
      const content = this.content();
      untracked(() => this.region.load(content));
    });
    effect(() => {
      const content = this.region.content();
      const origin = this.region.editor.origin();
      if (origin !== 'external' && origin !== 'history') {
        untracked(() => {
          if (this.store) this.store.withTextEdit(origin, this.historyGroup, () => this.contentChanged.emit(content));
          else this.contentChanged.emit(content);
        });
      }
    });
    // Capture before the surface and the block's own listeners. Structural Enter
    // stays with the content builder; multiline fields use the headless surface.
    this.element.addEventListener('paste', this.onPaste, true);
    this.element.addEventListener('keydown', this.onKeydown, true);
    this.element.addEventListener('beforeinput', this.onBeforeInput, true);
    afterNextRender(() => this.initialized.emit());
    afterRenderEffect(() => {
      const pending = this.store?.restoreTextSelection();
      const wrapper = this.element.closest('[data-block-id]');
      if (pending && wrapper?.getAttribute('data-block-id') === pending.blockId &&
          wrapper.querySelector('.ngs-content-editor-content-editable') === this.element) {
        this.activate();
        this.region.editor.setSelection(pending.selection);
        this.surface.focus();
        this.store!.restoreTextSelection.set(null);
      }
    });
  }

  activate(): void {
    this.region.activate();
    const id = this.element.closest('[data-block-id]')?.getAttribute('data-block-id');
    if (id && this.store) {
      const scope = this.builder && 'scope' in this.builder ? (this.builder as any).scope() : {};
      this.store.insertionTarget.set({ scope, afterId: id });
    }
  }
  focus(): void { this.activate(); this.surface.focus(); }
  getContent(): readonly NgsHeadlessEditorText[] { return this.region.content(); }
  alignment(): string { return this.props().find(prop => prop.name === 'text-alignment')?.value ?? 'left'; }
  setAlignment(value: string): void {
    this.propsChanged.emit([
      ...this.props().filter(prop => prop.name !== 'text-alignment'),
      { name: 'text-alignment', value }
    ]);
  }
  private readonly onPaste = (event: ClipboardEvent) => {
    if (event.defaultPrevented || this.region.editor.readOnly()) return;
    const html = event.clipboardData?.getData('text/html');
    if (!html) return;
    try {
      const config = this.builder?.rootBuilder.config() ?? {};
      const parsed = this.importer.fromHtml(html, config);
      this.activate();
      this.surface.syncSelectionFromDom();
      const id = this.element.closest('[data-block-id]')?.getAttribute('data-block-id');
      const structural = parsed.blocks.length > 1 || parsed.blocks.some(block => block.type !== 'paragraph');
      const selection = this.region.editor.selection();
      if (structural && id && this.builder && selection) {
        const lines = this.region.editor.document().blocks;
        const offset = (point: { blockId: string; offset: number }) => lines.slice(0, lines.findIndex(line => line.id === point.blockId))
          .reduce((sum, line) => sum + (line.content as ContentEditorText).reduce((total, run) => total + run.text.length, 0) + 1, 0) + point.offset;
        if (this.builder.rootBuilder.pasteBlocksAtSelection(id, parsed, offset(selection.anchor), offset(selection.focus))) {
          event.preventDefault(); event.stopImmediatePropagation(); return;
        }
      }
      const content = contentEditorImportedText(parsed.blocks);
      if (!content.some(run => run.text)) return;
      this.activate();
      this.surface.syncSelectionFromDom();
      event.preventDefault();
      event.stopImmediatePropagation();
      this.region.editor.insertTextContent(content);
    } catch {
      // The surface can still paste the plain-text representation on parse failure.
    }
  };
  private readonly onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && this.singleLine() && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.pressedEnter.emit(event);
    }
  };
  private readonly onBeforeInput = (event: InputEvent) => {
    if (event.inputType === 'insertParagraph' && this.singleLine() && !event.isComposing) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.pressedEnter.emit(new KeyboardEvent('keydown', { key: 'Enter' }));
    }
  };
  ngOnDestroy(): void {
    regions.delete(this.element);
    this.element.removeEventListener('paste', this.onPaste, true);
    this.element.removeEventListener('keydown', this.onKeydown, true);
    this.element.removeEventListener('beforeinput', this.onBeforeInput, true);
  }
}
