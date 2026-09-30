import {
  createNgsHeadlessEditorText,
  NgsHeadlessEditorMark,
  NgsHeadlessEditorText
} from './model';
import { NgsHeadlessEditorMarkDefinition } from './plugin';

/** Resolves mark definitions for rendering and parsing. */
export interface NgsHeadlessEditorMarkRegistry {
  getMarkDefinition(type: string): NgsHeadlessEditorMarkDefinition | undefined;
  getMarkDefinitions(): readonly NgsHeadlessEditorMarkDefinition[];
}

/** Attribute written on every mark wrapper element. */
export const NGS_HEADLESS_EDITOR_MARK_ATTRIBUTE = 'data-ngs-headless-editor-mark';

/**
 * Renders one text run: a text node wrapped in one element per mark, in mark
 * order. Unknown marks are wrapped in a span that only carries the mark type.
 */
export function renderNgsHeadlessEditorTextRun(
  document: Document,
  text: string,
  marks: readonly NgsHeadlessEditorMark[],
  registry: NgsHeadlessEditorMarkRegistry
): Node {
  let node: Node = document.createTextNode(text);
  for (const mark of marks) {
    const definition = registry.getMarkDefinition(mark.type);
    const wrapper = document.createElement(definition?.tagName ?? 'span');
    wrapper.setAttribute(NGS_HEADLESS_EDITOR_MARK_ATTRIBUTE, mark.type);
    definition?.applyAttributes?.(wrapper, mark);
    wrapper.append(node);
    node = wrapper;
  }
  return node;
}

/** Replaces the children of `target` with rendered runs, or a <br> when empty. */
export function renderNgsHeadlessEditorRuns(
  target: HTMLElement,
  runs: readonly NgsHeadlessEditorText[],
  registry: NgsHeadlessEditorMarkRegistry
): void {
  const document = target.ownerDocument;
  const fragment = document.createDocumentFragment();
  if (runs.some(run => run.text.length > 0)) {
    for (const run of runs) {
      fragment.append(renderNgsHeadlessEditorTextRun(document, run.text, run.marks, registry));
    }
  } else {
    fragment.append(document.createElement('br'));
  }
  target.replaceChildren(fragment);
}

/** Finds the mark definition that produced (or matches) an element. */
export function findNgsHeadlessEditorMarkDefinition(
  element: HTMLElement,
  registry: NgsHeadlessEditorMarkRegistry
): NgsHeadlessEditorMarkDefinition | undefined {
  const explicitType = element.getAttribute(NGS_HEADLESS_EDITOR_MARK_ATTRIBUTE);
  if (explicitType) {
    return registry.getMarkDefinition(explicitType);
  }
  const tag = element.tagName.toLowerCase();
  return registry.getMarkDefinitions().find(definition => (
    definition.tagName.toLowerCase() === tag ||
    definition.parseTags?.some(parseTag => parseTag.toLowerCase() === tag)
  ));
}

/**
 * Reads text runs from DOM, turning elements into marks through the registry.
 * With `lineBreaks`, <br> and the boundaries of block-level elements become "\n".
 * Elements without a matching mark definition keep their text but add no mark.
 */
export function readNgsHeadlessEditorInlineContent(
  element: Element,
  registry: NgsHeadlessEditorMarkRegistry,
  options: { lineBreaks?: boolean } = {}
): NgsHeadlessEditorText[] {
  const runs: NgsHeadlessEditorText[] = [];
  const blockTags = new Set(['p', 'div', 'li', 'tr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre']);
  const newline = () => {
    if (options.lineBreaks && runs.length > 0 && !runs[runs.length - 1].text.endsWith('\n')) {
      runs.push(createNgsHeadlessEditorText('\n'));
    }
  };
  const visit = (node: Node, marks: readonly NgsHeadlessEditorMark[]) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) {
        runs.push(createNgsHeadlessEditorText(node.textContent, marks));
      }
      return;
    }
    if (!(node instanceof Element)) {
      return;
    }
    const tag = node.tagName.toLowerCase();
    if (tag === 'br') {
      if (options.lineBreaks) {
        runs.push(createNgsHeadlessEditorText('\n', marks));
      }
      return;
    }
    const isBlock = options.lineBreaks && blockTags.has(tag);
    if (isBlock) {
      newline();
    }
    const definition = node instanceof HTMLElement ? findNgsHeadlessEditorMarkDefinition(node, registry) : undefined;
    const nextMarks = definition
      ? [...marks, { type: definition.type, attrs: definition.readAttributes?.(node as HTMLElement) }]
      : marks;
    for (const child of node.childNodes) {
      visit(child, nextMarks);
    }
    if (isBlock) {
      newline();
    }
  };

  for (const child of element.childNodes) {
    visit(child, []);
  }
  if (options.lineBreaks) {
    while (runs.length > 0 && runs[runs.length - 1].text === '\n') {
      runs.pop();
    }
  }
  return runs.length > 0 ? runs : [createNgsHeadlessEditorText()];
}
