import {
  afterNextRender,
  ApplicationRef,
  booleanAttribute,
  ComponentRef,
  createComponent,
  DestroyRef,
  Directive,
  DOCUMENT,
  effect,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  NgZone,
  reflectComponentType,
  Renderer2,
  Type,
  untracked
} from '@angular/core';
import { NgsHeadlessEditor } from './headless-editor';
import {
  createNgsHeadlessEditorDocument,
  isNgsHeadlessEditorTextContent,
  NgsHeadlessEditorBlock,
  NgsHeadlessEditorDocument,
  NgsHeadlessEditorPoint,
  NgsHeadlessEditorSelection,
  ngsHeadlessEditorBlocksEqual,
  normalizeNgsHeadlessEditorDocument,
  normalizeNgsHeadlessEditorTextContent
} from './model';
import { NgsHeadlessEditorBlockDefinition, NgsHeadlessEditorPlugin } from './plugin';
import { readNgsHeadlessEditorInlineContent, renderNgsHeadlessEditorTextRun } from './render';

const BLOCK_ID_ATTRIBUTE = 'data-ngs-headless-editor-block-id';
const BLOCK_TYPE_ATTRIBUTE = 'data-ngs-headless-editor-block-type';
const BLOCK_PLACEHOLDER_ATTRIBUTE = 'data-ngs-headless-editor-placeholder';
/** Browser formatting and structure commands the model does not map; they are blocked. */
const BLOCKED_INPUT_TYPES = /^(format|insertOrderedList$|insertUnorderedList$|insertHorizontalRule$|insertLink$)/;

/** A block as it is currently rendered into the surface. */
interface RenderedBlock {
  readonly block: NgsHeadlessEditorBlock;
  readonly element: HTMLElement;
  readonly definition: NgsHeadlessEditorBlockDefinition | undefined;
  readonly placeholder: string | null;
  readonly component: Type<unknown> | null;
  readonly componentRef: ComponentRef<unknown> | null;
  /** True when the browser may edit the element's content directly. */
  readonly editable: boolean;
}

const componentAcceptsBlock = new WeakMap<Type<unknown>, boolean>();

/**
 * Binds an `NgsHeadlessEditor` to a contenteditable element.
 *
 * Rendering is keyed by block id. Because the model is immutable, a block whose
 * object did not change keeps its DOM element untouched; only changed, added and
 * removed blocks are patched. Browser-owned DOM changes (IME composition, drag and
 * drop, unmapped input types) are tracked with a MutationObserver, read back only
 * for the blocks that were touched, and then re-rendered canonically.
 */
@Directive({
  selector: '[ngsHeadlessEditorSurface]',
  exportAs: 'ngsHeadlessEditorSurface',
  host: {
    'class': 'ngs-headless-editor-surface',
    'role': 'textbox',
    '[attr.contenteditable]': '(disabled() || editor.readOnly()) ? "false" : "true"',
    '[attr.aria-disabled]': '(disabled() || editor.readOnly()).toString()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-multiline]': 'true',
    '[attr.data-placeholder]': 'placeholder()',
    '[attr.data-empty]': 'editor.empty() ? "" : null',
    '[attr.spellcheck]': 'spellcheck().toString()',
    '(beforeinput)': 'onBeforeInput($event)',
    '(keydown)': 'onKeydown($event)',
    '(paste)': 'onPaste($event)',
    '(input)': 'onInput($event)',
    '(compositionstart)': 'onCompositionStart($event)',
    '(compositionend)': 'onCompositionEnd($event)',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(click)': 'onClick($event)',
    '(pointerdown)': 'onPointerDown($event)'
  }
})
export class NgsHeadlessEditorSurface {
  readonly editor = inject(NgsHeadlessEditor);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly documentRef = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);

  readonly placeholder = input('Write something…');
  readonly ariaLabel = input('Rich text editor');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly spellcheck = input(true, { transform: booleanAttribute });

  private rendering = false;
  private initialized = false;
  private programmaticFocus = false;
  private removeSelectionListener?: () => void;
  private rendered = new Map<string, RenderedBlock>();
  private renderedPlugins: readonly NgsHeadlessEditorPlugin[] | null = null;
  private mutationObserver: MutationObserver | null = null;
  private pendingMutations: MutationRecord[] = [];

  constructor() {
    effect(() => {
      this.editor.revision();
      this.editor.plugins();
      this.editor.readOnly();
      this.disabled();
      this.placeholder();
      const composing = this.editor.composing();
      if (!this.initialized || composing) {
        return;
      }
      untracked(() => this.renderDocument());
    });

    afterNextRender(() => {
      this.initialized = true;
      this.renderDocument();
      this.zone.runOutsideAngular(() => {
        this.removeSelectionListener = this.renderer.listen(
          this.documentRef,
          'selectionchange',
          () => this.syncSelectionFromDom()
        );
        const MutationObserverRef = this.documentRef.defaultView?.MutationObserver;
        if (MutationObserverRef) {
          this.mutationObserver = new MutationObserverRef(records => {
            this.pendingMutations.push(...records);
          });
          this.mutationObserver.observe(this.elementRef.nativeElement, {
            childList: true,
            characterData: true,
            subtree: true
          });
        }
      });
    });

    this.destroyRef.onDestroy(() => {
      this.removeSelectionListener?.();
      this.mutationObserver?.disconnect();
      for (const entry of this.rendered.values()) {
        entry.componentRef?.destroy();
      }
      this.rendered.clear();
    });
  }

  onBeforeInput(event: InputEvent): void {
    if (this.isForeignEvent(event)) {
      return;
    }
    if (this.disabled() || this.editor.readOnly()) {
      event.preventDefault();
      return;
    }
    if (event.isComposing || this.editor.composing()) {
      return;
    }

    this.syncSelectionFromDom();
    let handled = true;
    switch (event.inputType) {
      case 'insertText':
        this.editor.insertText(event.data ?? '', 'keyboard');
        break;
      case 'insertReplacementText': {
        // Spellcheck and autocorrect replace the target range, not the caret.
        const target = this.readTargetRange(event);
        if (target) {
          this.editor.setSelection(target);
        }
        const text = event.dataTransfer?.getData('text/plain') || event.data || '';
        if (text) {
          this.editor.insertText(text, 'keyboard');
        } else if (target) {
          this.editor.deleteRange(target, 'keyboard');
        }
        break;
      }
      case 'insertParagraph':
      case 'insertLineBreak':
        this.editor.splitBlock();
        break;
      case 'deleteContentBackward':
        this.editor.deleteBackward();
        break;
      case 'deleteContentForward':
        this.editor.deleteForward();
        break;
      case 'deleteByCut': {
        const selection = this.editor.selection();
        if (selection) {
          this.editor.deleteRange(selection, 'keyboard');
        }
        break;
      }
      case 'historyUndo':
        this.editor.undo();
        break;
      case 'historyRedo':
        this.editor.redo();
        break;
      case 'formatBold':
        this.editor.toggleMark('bold');
        break;
      case 'formatItalic':
        this.editor.toggleMark('italic');
        break;
      case 'formatStrikeThrough':
        this.editor.toggleMark('strike');
        break;
      case 'insertFromPaste':
      case 'insertFromDrop':
      case 'insertCompositionText':
      case 'deleteByDrag':
        handled = false;
        break;
      default:
        if (event.inputType.startsWith('delete')) {
          // deleteWordBackward, deleteSoftLineBackward, deleteHardLineForward, ...
          this.deleteTargetRange(event);
        } else if (!BLOCKED_INPUT_TYPES.test(event.inputType)) {
          // Unknown insertions (transpose, yank, ...) mutate the DOM and are read
          // back into the model by the input handler.
          handled = false;
        }
        break;
    }

    if (handled) {
      event.preventDefault();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.isForeignEvent(event) || this.disabled() || this.editor.readOnly() || event.isComposing) {
      return;
    }
    this.syncSelectionFromDom();
    if (this.editor.handleKeydown(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onPaste(event: ClipboardEvent): void {
    if (this.isForeignEvent(event)) {
      return;
    }
    if (this.disabled() || this.editor.readOnly()) {
      event.preventDefault();
      return;
    }
    this.syncSelectionFromDom();
    if (this.editor.handlePaste(event)) {
      event.preventDefault();
      return;
    }
    const text = event.clipboardData?.getData('text/plain');
    if (typeof text === 'string') {
      event.preventDefault();
      this.editor.insertText(text, 'paste');
    }
  }

  onInput(event?: Event): void {
    if (event && this.isForeignEvent(event)) {
      return;
    }
    if (!this.editor.composing() && !this.rendering) {
      this.commitDomState();
    }
  }

  onCompositionStart(event?: Event): void {
    if (event && this.isForeignEvent(event)) {
      return;
    }
    this.syncSelectionFromDom();
    this.editor.setComposing(true);
  }

  onCompositionEnd(event?: Event): void {
    if (event && this.isForeignEvent(event)) {
      return;
    }
    this.editor.setComposing(false);
    this.commitDomState();
  }

  onFocus(): void {
    this.editor.setFocused(true);
    if (!this.programmaticFocus) {
      this.syncSelectionFromDom();
    }
  }

  onBlur(): void {
    this.editor.setFocused(false);
  }

  onClick(event: MouseEvent): void {
    if (this.disabled() || this.editor.readOnly()) {
      return;
    }

    const target = event.target;
    if (target instanceof Element && target.closest('a[data-ngs-headless-editor-mark="link"]')) {
      event.preventDefault();
    }
  }

  onPointerDown(event: PointerEvent): void {
    if (
      this.isForeignEvent(event) ||
      this.disabled() ||
      this.editor.readOnly() ||
      !this.editor.empty()
    ) {
      return;
    }

    const block = this.editor.document().blocks.find(item => isNgsHeadlessEditorTextContent(item.content));
    if (!block) {
      return;
    }

    event.preventDefault();
    this.elementRef.nativeElement.focus();
    this.editor.setSelection({
      anchor: { blockId: block.id, offset: 0 },
      focus: { blockId: block.id, offset: 0 }
    });
    this.restoreSelectionToDom();
  }

  focus(): void {
    this.programmaticFocus = true;
    try {
      this.elementRef.nativeElement.focus();
      this.restoreSelectionToDom();
    } finally {
      this.programmaticFocus = false;
    }
  }

  getSelectionRect(): DOMRect | null {
    const root = this.elementRef.nativeElement;
    const selection = this.documentRef.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const ancestor = range.commonAncestorContainer;
    if (ancestor !== root && !root.contains(ancestor)) {
      return null;
    }

    const rect = range.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? rect : null;
  }

  /** Returns the element that currently renders a block, if any. */
  getBlockElement(blockId: string): HTMLElement | null {
    return this.rendered.get(blockId)?.element ?? null;
  }

  /**
   * Events that originate inside a non-editable block (for example an input or a
   * textarea rendered by a component block) belong to that widget, not to the
   * editor, even though they bubble through the surface.
   */
  private isForeignEvent(event: Event): boolean {
    const target = event.target;
    if (!(target instanceof Node) || target === this.elementRef.nativeElement) {
      return false;
    }
    const block = this.closestBlock(target);
    const entry = block ? this.rendered.get(block.getAttribute(BLOCK_ID_ATTRIBUTE) ?? '') : undefined;
    return !!entry && entry.element === block && !entry.editable;
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  /**
   * Brings the DOM in line with the model. Blocks whose object, definition,
   * placeholder and component did not change are reused as-is; `dirty` forces
   * a re-render of block elements the browser modified.
   */
  private renderDocument(dirty: ReadonlySet<HTMLElement> = new Set()): void {
    const root = this.elementRef.nativeElement;
    const plugins = this.editor.plugins();
    if (plugins !== this.renderedPlugins) {
      // Block and mark definitions may have changed: rebuild everything.
      this.destroyRendered(this.rendered.values());
      this.rendered = new Map();
      this.renderedPlugins = plugins;
    }

    const interactive = !(this.disabled() || this.editor.readOnly());
    const documentEmpty = this.editor.empty();
    const next = new Map<string, RenderedBlock>();
    const ordered: HTMLElement[] = [];
    let placeholderAssigned = false;

    for (const block of this.editor.document().blocks) {
      const definition = this.editor.getBlockDefinition(block.type);
      const component = blockComponent(definition, interactive);
      let placeholder: string | null = null;
      if (
        !component &&
        !definition?.render &&
        documentEmpty &&
        !placeholderAssigned &&
        isNgsHeadlessEditorTextContent(block.content) &&
        block.content.every(run => run.text.trim().length === 0)
      ) {
        placeholder = this.placeholder();
        placeholderAssigned = true;
      }

      const previous = this.rendered.get(block.id);
      let entry: RenderedBlock;
      if (
        previous &&
        !dirty.has(previous.element) &&
        previous.definition === definition &&
        previous.component === component &&
        (component !== null || (previous.block === block && previous.placeholder === placeholder))
      ) {
        entry = previous;
        if (previous.componentRef && previous.block !== block) {
          // Keep component instances (and their DOM, e.g. a playing video) alive.
          setComponentBlock(previous.componentRef, component, block);
          entry = { ...previous, block };
        }
      } else {
        entry = this.createRenderedBlock(block, definition, component, placeholder);
      }
      next.set(block.id, entry);
      ordered.push(entry.element);
    }

    const reusedElements = new Set(ordered);
    this.destroyRendered(
      [...this.rendered.values()].filter(entry => !reusedElements.has(entry.element))
    );
    this.rendered = next;

    this.rendering = true;
    try {
      // Keyed reconciliation: move/insert expected elements, drop anything else
      // (including stray nodes the browser may have created).
      let cursor: ChildNode | null = root.firstChild;
      for (const element of ordered) {
        if (cursor === element) {
          cursor = cursor.nextSibling;
          continue;
        }
        root.insertBefore(element, cursor);
      }
      while (cursor) {
        const nextNode: ChildNode | null = cursor.nextSibling;
        root.removeChild(cursor);
        cursor = nextNode;
      }
    } finally {
      this.rendering = false;
    }
    this.discardMutations();

    if (this.editor.focused()) {
      this.restoreSelectionToDom();
    }
  }

  private createRenderedBlock(
    block: NgsHeadlessEditorBlock,
    definition: NgsHeadlessEditorBlockDefinition | undefined,
    component: Type<unknown> | null,
    placeholder: string | null
  ): RenderedBlock {
    const element = this.documentRef.createElement(definition?.tagName ?? 'div');
    element.setAttribute(BLOCK_ID_ATTRIBUTE, block.id);
    element.setAttribute(BLOCK_TYPE_ATTRIBUTE, block.type);

    if (component) {
      element.setAttribute('contenteditable', 'false');
      const componentRef = createComponent(component, {
        environmentInjector: this.environmentInjector,
        elementInjector: this.injector,
        hostElement: element
      });
      setComponentBlock(componentRef, component, block);
      this.appRef.attachView(componentRef.hostView);
      componentRef.changeDetectorRef.detectChanges();
      return { block, element, definition, placeholder, component, componentRef, editable: false };
    }

    if (definition?.editable === false) {
      element.setAttribute('contenteditable', 'false');
    }

    if (definition?.render) {
      definition.render(element, block);
    } else if (isNgsHeadlessEditorTextContent(block.content)) {
      const contentRoot = definition?.contentTagName
        ? this.documentRef.createElement(definition.contentTagName)
        : element;
      if (placeholder !== null) {
        contentRoot.setAttribute(BLOCK_PLACEHOLDER_ATTRIBUTE, placeholder);
      }
      if (block.content.some(run => run.text.length > 0)) {
        for (const run of block.content) {
          contentRoot.append(renderNgsHeadlessEditorTextRun(this.documentRef, run.text, run.marks, this.editor));
        }
      } else {
        contentRoot.append(this.documentRef.createElement('br'));
      }
      if (contentRoot !== element) {
        element.append(contentRoot);
      }
    }

    return {
      block,
      element,
      definition,
      placeholder,
      component: null,
      componentRef: null,
      editable: definition?.editable !== false
    };
  }

  private destroyRendered(entries: Iterable<RenderedBlock>): void {
    for (const entry of entries) {
      entry.componentRef?.destroy();
    }
  }

  // ---------------------------------------------------------------------------
  // Reading browser-owned DOM changes back into the model
  // ---------------------------------------------------------------------------

  private commitDomState(): void {
    const dirty = this.collectDirtyBlocks();
    const selection = this.readSelectionFromDom();
    const document = this.readDocumentFromDom(dirty);
    this.editor.commitDomDocument(document, selection);
    // Replace whatever markup the browser produced with the canonical rendering,
    // even when the model did not change (e.g. a stray <font> or <div>).
    this.renderDocument(dirty);
  }

  /** Editable block elements touched by the browser since the last render. */
  private collectDirtyBlocks(): Set<HTMLElement> {
    const records = [...this.pendingMutations, ...(this.mutationObserver?.takeRecords() ?? [])];
    this.pendingMutations = [];
    const root = this.elementRef.nativeElement;
    const dirty = new Set<HTMLElement>();
    const editableElements = new Set(
      [...this.rendered.values()].filter(entry => entry.editable).map(entry => entry.element)
    );

    const mark = (node: Node | null) => {
      const block = node ? this.closestBlock(node) : null;
      if (block && editableElements.has(block)) {
        dirty.add(block);
      }
    };

    for (const record of records) {
      if (record.target === root) {
        record.addedNodes.forEach(node => mark(node));
        continue;
      }
      mark(record.target);
    }

    // Without MutationObserver support every editable block is treated as dirty.
    return this.mutationObserver ? dirty : editableElements;
  }

  private discardMutations(): void {
    this.mutationObserver?.takeRecords();
    this.pendingMutations = [];
  }

  private readDocumentFromDom(dirty: ReadonlySet<HTMLElement>): NgsHeadlessEditorDocument {
    const root = this.elementRef.nativeElement;
    const previousBlocks = new Map(this.editor.document().blocks.map(block => [block.id, block]));
    const blocks: NgsHeadlessEditorBlock[] = [];

    for (const element of root.querySelectorAll<HTMLElement>(`[${BLOCK_ID_ATTRIBUTE}]`)) {
      if (element.parentElement?.closest(`[${BLOCK_ID_ATTRIBUTE}]`)) {
        continue;
      }
      const id = element.getAttribute(BLOCK_ID_ATTRIBUTE) ?? '';
      const type = element.getAttribute(BLOCK_TYPE_ATTRIBUTE) ?? 'paragraph';
      const entry = this.rendered.get(id);
      const previous = previousBlocks.get(id);

      if (entry && entry.element === element && !dirty.has(element)) {
        blocks.push(entry.block);
        continue;
      }

      const definition = this.editor.getBlockDefinition(type);
      if (previous && (entry?.componentRef || definition?.editable === false)) {
        blocks.push(previous);
      } else if (definition?.read && previous) {
        blocks.push(definition.read(element, previous));
      } else {
        const read: NgsHeadlessEditorBlock = {
          id,
          type,
          content: normalizeNgsHeadlessEditorTextContent(readNgsHeadlessEditorInlineContent(element, this.editor))
        };
        blocks.push(previous && ngsHeadlessEditorBlocksEqual(previous, read) ? previous : read);
      }
    }

    if (blocks.length === 0) {
      return createNgsHeadlessEditorDocument(root.textContent ?? '');
    }
    return normalizeNgsHeadlessEditorDocument({ version: 1, blocks });
  }

  // ---------------------------------------------------------------------------
  // Selection mapping
  // ---------------------------------------------------------------------------

  /** Deletes the range the browser reports for a word/line deletion. */
  private deleteTargetRange(event: InputEvent): void {
    const target = this.readTargetRange(event);
    if (target) {
      const collapsed = target.anchor.blockId === target.focus.blockId &&
        target.anchor.offset === target.focus.offset;
      if (!collapsed) {
        this.editor.deleteRange(target, 'keyboard');
      }
      return;
    }
    if (event.inputType.endsWith('Forward')) {
      this.editor.deleteForward();
    } else {
      this.editor.deleteBackward();
    }
  }

  private readTargetRange(event: InputEvent): NgsHeadlessEditorSelection | null {
    const range = typeof event.getTargetRanges === 'function'
      ? event.getTargetRanges()[0]
      : undefined;
    if (!range) {
      return null;
    }
    const anchor = this.domPositionToPoint(range.startContainer, range.startOffset);
    const focus = this.domPositionToPoint(range.endContainer, range.endOffset);
    return anchor && focus ? { anchor, focus } : null;
  }

  private syncSelectionFromDom(): void {
    if (this.rendering) {
      return;
    }
    const selection = this.readSelectionFromDom();
    if (selection) {
      this.editor.setSelection(selection);
    }
  }

  private readSelectionFromDom(): NgsHeadlessEditorSelection | null {
    const nativeSelection = this.documentRef.getSelection();
    const root = this.elementRef.nativeElement;
    if (!nativeSelection?.anchorNode || !nativeSelection.focusNode) {
      return null;
    }
    if (!root.contains(nativeSelection.anchorNode) || !root.contains(nativeSelection.focusNode)) {
      return null;
    }
    // Selections inside component blocks belong to their own controls or nested editors.
    if (
      this.isInsideComponentBlock(nativeSelection.anchorNode) ||
      this.isInsideComponentBlock(nativeSelection.focusNode)
    ) {
      return null;
    }
    const anchor = this.domPositionToPoint(nativeSelection.anchorNode, nativeSelection.anchorOffset);
    const focus = this.domPositionToPoint(nativeSelection.focusNode, nativeSelection.focusOffset);
    return anchor && focus ? { anchor, focus } : null;
  }

  private domPositionToPoint(node: Node, offset: number): NgsHeadlessEditorPoint | null {
    const root = this.elementRef.nativeElement;
    if (node === root) {
      // Boundary points between blocks are expressed as a child index of the surface.
      const children = [...root.childNodes];
      const next = children.slice(offset).find(isBlockElement);
      if (next) {
        return { blockId: next.getAttribute(BLOCK_ID_ATTRIBUTE) ?? '', offset: 0 };
      }
      const last = children.filter(isBlockElement).at(-1);
      return last
        ? { blockId: last.getAttribute(BLOCK_ID_ATTRIBUTE) ?? '', offset: last.textContent?.length ?? 0 }
        : null;
    }

    const block = this.closestBlock(node);
    if (!block) {
      return null;
    }
    const range = this.documentRef.createRange();
    range.selectNodeContents(block);
    try {
      range.setEnd(node, offset);
    } catch {
      return null;
    }
    return {
      blockId: block.getAttribute(BLOCK_ID_ATTRIBUTE) ?? '',
      offset: range.toString().length
    };
  }

  /**
   * The top-level block element that contains a node. Only direct children of
   * the surface are blocks of this editor; elements with block attributes deeper
   * down belong to nested editors (for example inside a table cell).
   */
  private closestBlock(node: Node): HTMLElement | null {
    const root = this.elementRef.nativeElement;
    let current: Node | null = node;
    while (current && current.parentNode !== root) {
      current = current.parentNode;
    }
    return current instanceof HTMLElement && current.hasAttribute(BLOCK_ID_ATTRIBUTE) ? current : null;
  }

  /** True when a node is inside a block rendered by an Angular component. */
  private isInsideComponentBlock(node: Node): boolean {
    const block = this.closestBlock(node);
    const entry = block ? this.rendered.get(block.getAttribute(BLOCK_ID_ATTRIBUTE) ?? '') : undefined;
    return !!entry && entry.element === block && entry.componentRef !== null;
  }

  private restoreSelectionToDom(): void {
    const selection = this.editor.selection();
    if (!selection) {
      return;
    }
    const anchor = this.pointToDomPosition(selection.anchor);
    const focus = this.pointToDomPosition(selection.focus);
    if (!anchor || !focus) {
      return;
    }

    const nativeSelection = this.documentRef.getSelection();
    if (!nativeSelection) {
      return;
    }
    if (
      nativeSelection.anchorNode === anchor.node &&
      nativeSelection.anchorOffset === anchor.offset &&
      nativeSelection.focusNode === focus.node &&
      nativeSelection.focusOffset === focus.offset
    ) {
      return;
    }
    try {
      nativeSelection.setBaseAndExtent(
        anchor.node,
        anchor.offset,
        focus.node,
        focus.offset
      );
    } catch {
      const range = this.documentRef.createRange();
      range.setStart(anchor.node, anchor.offset);
      range.setEnd(focus.node, focus.offset);
      nativeSelection.removeAllRanges();
      nativeSelection.addRange(range);
    }
  }

  private pointToDomPosition(point: NgsHeadlessEditorPoint): { node: Node; offset: number } | null {
    const block = this.rendered.get(point.blockId)?.element;
    if (!block?.isConnected) {
      return null;
    }

    const walker = this.documentRef.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let remaining = point.offset;
    let textNode = walker.nextNode();
    while (textNode) {
      const length = textNode.textContent?.length ?? 0;
      if (remaining <= length) {
        return { node: textNode, offset: remaining };
      }
      remaining -= length;
      textNode = walker.nextNode();
    }
    return { node: block, offset: 0 };
  }
}

function isBlockElement(node: ChildNode): node is HTMLElement {
  return node instanceof HTMLElement && node.hasAttribute(BLOCK_ID_ATTRIBUTE);
}

function blockComponent(
  definition: NgsHeadlessEditorBlockDefinition | undefined,
  interactive: boolean
): Type<unknown> | null {
  const component = interactive
    ? definition?.editorComponent ?? definition?.rendererComponent
    : definition?.rendererComponent ?? definition?.editorComponent;
  return component ?? null;
}

function setComponentBlock(
  componentRef: ComponentRef<unknown>,
  component: Type<unknown> | null,
  block: NgsHeadlessEditorBlock
): void {
  if (!component) {
    return;
  }
  let accepts = componentAcceptsBlock.get(component);
  if (accepts === undefined) {
    accepts = reflectComponentType(component)?.inputs.some(item => item.templateName === 'block') ?? false;
    componentAcceptsBlock.set(component, accepts);
  }
  if (accepts) {
    componentRef.setInput('block', block);
  }
}
