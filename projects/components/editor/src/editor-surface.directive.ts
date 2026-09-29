import {
  afterNextRender,
  booleanAttribute,
  DestroyRef,
  Directive,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  Renderer2,
  untracked
} from '@angular/core';
import { NgsEditor } from './editor';
import {
  createNgsEditorDocument,
  createNgsEditorParagraph,
  createNgsEditorText,
  isNgsEditorTextContent,
  NgsEditorBlock,
  NgsEditorDocument,
  NgsEditorMark,
  NgsEditorPoint,
  NgsEditorSelection,
  normalizeNgsEditorDocument,
  normalizeNgsEditorTextContent
} from './model';
import { NgsEditorMarkDefinition } from './plugin';

const BLOCK_ID_ATTRIBUTE = 'data-ngs-editor-block-id';
const BLOCK_TYPE_ATTRIBUTE = 'data-ngs-editor-block-type';
const BLOCK_PLACEHOLDER_ATTRIBUTE = 'data-ngs-editor-placeholder';

@Directive({
  selector: '[ngsEditorSurface]',
  exportAs: 'ngsEditorSurface',
  host: {
    'class': 'ngs-editor-surface',
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
    '(input)': 'onInput()',
    '(compositionstart)': 'onCompositionStart()',
    '(compositionend)': 'onCompositionEnd()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(click)': 'onClick($event)',
    '(pointerdown)': 'onPointerDown($event)'
  }
})
export class NgsEditorSurface {
  readonly editor = inject(NgsEditor);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly documentRef = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly placeholder = input('Write something…');
  readonly ariaLabel = input('Rich text editor');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly spellcheck = input(true, { transform: booleanAttribute });

  private rendering = false;
  private initialized = false;
  private programmaticFocus = false;
  private removeSelectionListener?: () => void;

  constructor() {
    effect(() => {
      this.editor.revision();
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
      });
    });

    this.destroyRef.onDestroy(() => this.removeSelectionListener?.());
  }

  onBeforeInput(event: InputEvent): void {
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
      case 'insertReplacementText':
        this.editor.insertText(event.data ?? '', 'keyboard');
        break;
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
        handled = false;
        break;
      default:
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.editor.readOnly() || event.isComposing) {
      return;
    }
    this.syncSelectionFromDom();
    if (this.editor.handleKeydown(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onPaste(event: ClipboardEvent): void {
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

  onInput(): void {
    if (!this.editor.composing() && !this.rendering) {
      this.commitDomState();
    }
  }

  onCompositionStart(): void {
    this.syncSelectionFromDom();
    this.editor.setComposing(true);
  }

  onCompositionEnd(): void {
    this.commitDomState();
    this.editor.setComposing(false);
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
    if (target instanceof Element && target.closest('a[data-ngs-editor-mark="link"]')) {
      event.preventDefault();
    }
  }

  onPointerDown(event: PointerEvent): void {
    if (this.disabled() || this.editor.readOnly() || !this.editor.empty()) {
      return;
    }

    const block = this.editor.document().blocks.find(item => isNgsEditorTextContent(item.content));
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

  private renderDocument(): void {
    const root = this.elementRef.nativeElement;
    const fragment = this.documentRef.createDocumentFragment();
    const documentEmpty = this.editor.empty();
    let placeholderAssigned = false;

    for (const block of this.editor.document().blocks) {
      const definition = this.editor.getBlockDefinition(block.type);
      const element = this.documentRef.createElement(definition?.tagName ?? 'div');
      element.setAttribute(BLOCK_ID_ATTRIBUTE, block.id);
      element.setAttribute(BLOCK_TYPE_ATTRIBUTE, block.type);
      if (definition?.editable === false) {
        element.setAttribute('contenteditable', 'false');
      }

      if (definition?.render) {
        definition.render(element, block);
      } else if (isNgsEditorTextContent(block.content)) {
        const contentRoot = definition?.contentTagName
          ? this.documentRef.createElement(definition.contentTagName)
          : element;
        const blockEmpty = block.content.every(run => run.text.trim().length === 0);
        if (documentEmpty && blockEmpty && !placeholderAssigned) {
          contentRoot.setAttribute(BLOCK_PLACEHOLDER_ATTRIBUTE, this.placeholder());
          placeholderAssigned = true;
        }
        const hasText = block.content.some(run => run.text.length > 0);
        if (!hasText) {
          contentRoot.append(this.documentRef.createElement('br'));
        } else {
          for (const run of block.content) {
            contentRoot.append(this.renderTextRun(run.text, run.marks));
          }
        }
        if (contentRoot !== element) {
          element.append(contentRoot);
        }
      }
      fragment.append(element);
    }

    this.rendering = true;
    root.replaceChildren(fragment);
    this.rendering = false;
    if (this.editor.focused()) {
      this.restoreSelectionToDom();
    }
  }

  private renderTextRun(text: string, marks: readonly NgsEditorMark[]): Node {
    let node: Node = this.documentRef.createTextNode(text);
    for (const mark of marks) {
      const definition = this.editor.getMarkDefinition(mark.type);
      const wrapper = this.documentRef.createElement(definition?.tagName ?? 'span');
      wrapper.setAttribute('data-ngs-editor-mark', mark.type);
      definition?.applyAttributes?.(wrapper, mark);
      wrapper.append(node);
      node = wrapper;
    }
    return node;
  }

  private commitDomState(): void {
    const selection = this.readSelectionFromDom();
    const document = this.readDocumentFromDom();
    this.editor.commitDomDocument(document, selection);
  }

  private readDocumentFromDom(): NgsEditorDocument {
    const root = this.elementRef.nativeElement;
    const blocks: NgsEditorBlock[] = [];
    const elements = root.querySelectorAll<HTMLElement>(`[${BLOCK_ID_ATTRIBUTE}]`);

    for (const element of elements) {
      const id = element.getAttribute(BLOCK_ID_ATTRIBUTE) ?? '';
      const type = element.getAttribute(BLOCK_TYPE_ATTRIBUTE) ?? 'paragraph';
      const definition = this.editor.getBlockDefinition(type);
      const previous = this.editor.document().blocks.find(block => block.id === id);
      if (definition?.read && previous) {
        blocks.push(definition.read(element, previous));
      } else if (definition?.editable === false && previous) {
        blocks.push(previous);
      } else {
        const content = this.readInlineContent(element);
        blocks.push({
          id,
          type,
          content: normalizeNgsEditorTextContent(content)
        });
      }
    }

    if (blocks.length === 0) {
      return createNgsEditorDocument(root.textContent ?? '');
    }
    return normalizeNgsEditorDocument({ version: 1, blocks });
  }

  private readInlineContent(element: HTMLElement): readonly ReturnType<typeof createNgsEditorText>[] {
    const runs: ReturnType<typeof createNgsEditorText>[] = [];
    const visit = (node: Node, marks: readonly NgsEditorMark[]) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent) {
          runs.push(createNgsEditorText(node.textContent, marks));
        }
        return;
      }
      if (!(node instanceof HTMLElement) || node.tagName.toLowerCase() === 'br') {
        return;
      }

      const definition = this.findMarkDefinition(node);
      const nextMarks = definition
        ? [...marks, {
          type: definition.type,
          attrs: definition.readAttributes?.(node)
        }]
        : marks;
      for (const child of node.childNodes) {
        visit(child, nextMarks);
      }
    };

    for (const child of element.childNodes) {
      visit(child, []);
    }
    return runs.length > 0 ? runs : [createNgsEditorText()];
  }

  private findMarkDefinition(element: HTMLElement): NgsEditorMarkDefinition | undefined {
    const explicitType = element.getAttribute('data-ngs-editor-mark');
    if (explicitType) {
      return this.editor.getMarkDefinition(explicitType);
    }
    const tag = element.tagName.toLowerCase();
    return this.editor.getMarkDefinitions().find(definition => (
      definition.tagName.toLowerCase() === tag ||
      definition.parseTags?.some(parseTag => parseTag.toLowerCase() === tag)
    ));
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

  private readSelectionFromDom(): NgsEditorSelection | null {
    const nativeSelection = this.documentRef.getSelection();
    const root = this.elementRef.nativeElement;
    if (!nativeSelection?.anchorNode || !nativeSelection.focusNode) {
      return null;
    }
    if (!root.contains(nativeSelection.anchorNode) || !root.contains(nativeSelection.focusNode)) {
      return null;
    }
    const anchor = this.domPositionToPoint(nativeSelection.anchorNode, nativeSelection.anchorOffset);
    const focus = this.domPositionToPoint(nativeSelection.focusNode, nativeSelection.focusOffset);
    return anchor && focus ? { anchor, focus } : null;
  }

  private domPositionToPoint(node: Node, offset: number): NgsEditorPoint | null {
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

  private closestBlock(node: Node): HTMLElement | null {
    const element = node.nodeType === Node.ELEMENT_NODE
      ? node as HTMLElement
      : node.parentElement;
    return element?.closest<HTMLElement>(`[${BLOCK_ID_ATTRIBUTE}]`) ?? null;
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

  private pointToDomPosition(point: NgsEditorPoint): { node: Node; offset: number } | null {
    const root = this.elementRef.nativeElement;
    const block = [...root.querySelectorAll<HTMLElement>(`[${BLOCK_ID_ATTRIBUTE}]`)]
      .find(element => element.getAttribute(BLOCK_ID_ATTRIBUTE) === point.blockId);
    if (!block) {
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
