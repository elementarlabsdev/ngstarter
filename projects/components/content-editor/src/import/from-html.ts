import {
  basicTextEditorPlugin, colorEditorPlugin, linkEditorPlugin, createNgsHeadlessEditorId,
  createNgsHeadlessEditorText, normalizeNgsHeadlessEditorTextContent, NgsHeadlessEditorMark, NgsHeadlessEditorText
} from '@ngstarter-ui/components/headless-editor';
import type { ContentEditorConfig } from '../config';
import type { ContentEditorBlock, ContentEditorDocument, ContentEditorListItem } from '../types';
import { safeContentEditorHtmlUrl } from '../html/html-utils';
import { ContentEditorHtmlImportContext, ContentEditorHtmlImportOptions, ContentEditorImportError } from './types';
import { contentEditorFromJson } from './from-json';

const ignoredTags = new Set(['script', 'style', 'noscript', 'template', 'object', 'embed', 'head', 'meta', 'link']);
const blockTags = new Set(['p', 'div', 'section', 'article', 'header', 'footer', 'main', 'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote', 'figure', 'ul', 'ol', 'table', 'details', 'hr']);

/** Imports semantic HTML into native blocks. Scripts, event handlers and arbitrary CSS are never stored. */
export function contentEditorFromHtml(html: string, config: ContentEditorConfig = {}, options: ContentEditorHtmlImportOptions = {}): ContentEditorDocument {
  if (typeof html !== 'string') throw new ContentEditorImportError('$html', 'Expected an HTML string');
  const owner = options.document ?? globalThis.document;
  if (!owner?.implementation?.createHTMLDocument) {
    throw new ContentEditorImportError('$html', 'HTML import requires a DOM document; supply options.document when running on the server');
  }
  const inert = owner.implementation.createHTMLDocument('');
  inert.body.innerHTML = html;
  const maxDepth = options.maxDepth ?? 64;
  const maxBlocks = options.maxBlocks ?? 10000;
  if (!Number.isInteger(maxDepth) || maxDepth < 1 || !Number.isInteger(maxBlocks) || maxBlocks < 1) throw new ContentEditorImportError('$options', 'maxDepth and maxBlocks must be positive integers');
  const definitions = [...new Map([...basicTextEditorPlugin().marks!, ...colorEditorPlugin().marks!, ...linkEditorPlugin().marks!, ...(config.importMarks ?? [])].map(mark => [mark.type, mark])).values()];
  const overrides = Object.values(config.blocks ?? {}).flatMap(block => block.fromHtml ? [block.fromHtml] : []);
  let depth = 0;
  let count = 0;
  const guarded = <T>(read: () => T): T => {
    if (++depth > maxDepth) throw new ContentEditorImportError('$html', `Maximum nesting depth (${maxDepth}) exceeded`);
    try { return read(); } finally { depth--; }
  };
  const tag = (element: Element) => element.tagName.toLowerCase();
  const children = (element: Element) => Array.from(element.children);
  const direct = (element: Element, selector: string) => children(element).find(child => child.matches(selector));
  const alignment = (element: Element) => {
    const value = (element as HTMLElement).style?.textAlign || element.getAttribute('align');
    return value && ['left', 'center', 'right', 'justify'].includes(value) ? [{ name: 'text-alignment', value }] : [];
  };
  const dimension = (element: Element, name: string): number | null => {
    const raw = element.getAttribute(name);
    if (!raw || !/^\d+(?:\.\d+)?$/.test(raw)) return null;
    const value = Number(raw); return value > 0 && Number.isFinite(value) ? value : null;
  };
  const createBlock: ContentEditorHtmlImportContext['createBlock'] = (type, content, attrs) => {
    if (++count > maxBlocks) throw new ContentEditorImportError('$html', `Maximum block count (${maxBlocks}) exceeded`);
    return { id: createNgsHeadlessEditorId(type), type, content, ...(attrs ? { attrs } : {}) };
  };
  const parseText = (element: Element): NgsHeadlessEditorText[] => {
    const runs: NgsHeadlessEditorText[] = [];
    const newline = () => { if (runs.length && !runs.at(-1)!.text.endsWith('\n')) runs.push(createNgsHeadlessEditorText('\n')); };
    const visit = (node: Node, marks: readonly NgsHeadlessEditorMark[]): void => guarded(() => {
      if (node.nodeType === 3) {
        const text = (node.textContent ?? '').replace(/[\t\r\n ]+/g, ' ');
        if (text) runs.push(createNgsHeadlessEditorText(text, marks));
        return;
      }
      if (node.nodeType !== 1) return;
      const el = node as HTMLElement;
      const name = tag(el);
      if (ignoredTags.has(name) || ['iframe', 'img', 'video', 'audio', 'ul', 'ol'].includes(name)) return;
      if (name === 'br') { runs.push(createNgsHeadlessEditorText('\n', marks)); return; }
      const next = [...marks];
      for (const definition of definitions) {
        const explicit = el.getAttribute('data-ngs-headless-editor-mark');
        const styleMark = ['textColor', 'backgroundColor'].includes(definition.type) && !!el.style;
        if (explicit ? explicit !== definition.type : name !== definition.tagName && !definition.parseTags?.includes(name) && !styleMark) continue;
        const attrs = definition.readAttributes?.(el);
        if (!definition.readAttributes || attrs) next.push({ type: definition.type, ...(attrs ? { attrs } : {}) });
      }
      // Common HTML produced by external WYSIWYG editors also expresses marks as inline styles.
      const css = el.style;
      if (css?.fontWeight === 'bold' || Number(css?.fontWeight) >= 600) next.push({ type: 'bold' });
      if (css?.fontStyle === 'italic') next.push({ type: 'italic' });
      if (css?.textDecoration.includes('underline')) next.push({ type: 'underline' });
      if (css?.textDecoration.includes('line-through')) next.push({ type: 'strike' });
      if (blockTags.has(name)) newline();
      Array.from(node.childNodes).forEach(child => visit(child, next));
      if (blockTags.has(name)) newline();
    });
    visit(element, []);
    while (runs.length && !runs[0].text.trim()) runs.shift();
    while (runs.length && !runs.at(-1)!.text.trim()) runs.pop();
    if (runs.length) {
      runs[0] = { ...runs[0], text: runs[0].text.replace(/^\s+/, '') };
      const last = runs.length - 1;
      runs[last] = { ...runs[last], text: runs[last].text.replace(/\s+$/, '') };
    }
    return [...normalizeNgsHeadlessEditorTextContent(runs)];
  };
  const listItems = (element: Element): ContentEditorListItem[] => guarded(() => children(element).filter(el => tag(el) === 'li').map(li => {
    const text = li.cloneNode(true) as Element;
    children(text).filter(el => ['ul', 'ol'].includes(tag(el))).forEach(el => el.remove());
    return { content: parseText(text), props: alignment(li), children: children(li).filter(el => ['ul', 'ol'].includes(tag(el))).flatMap(listItems) };
  }));
  const media = (element: Element, figure?: Element): ContentEditorBlock[] => {
    const name = tag(element);
    const kind = name === 'img' ? 'image' : name === 'video' ? 'media' : 'embed';
    const src = safeContentEditorHtmlUrl(element.getAttribute('src') || element.querySelector('source')?.getAttribute('src'), kind);
    if (!src) return [];
    const caption = figure ? direct(figure, 'figcaption') : undefined;
    const settings = Object.fromEntries(['width', 'height'].flatMap(key => { const n = dimension(element, key); return n ? [[key, n]] : []; }));
    const content = name === 'img' ? { src, alt: element.getAttribute('alt') ?? '' }
      : name === 'video' ? { src, caption: caption?.textContent ?? '', orientation: 'landscape' }
      : { url: src, type: element.getAttribute('title') ?? '' };
    return [createBlock(name === 'img' ? 'image' : name === 'video' ? 'video' : 'embed', content, { settings })];
  };
  const builtin = (element: Element): ContentEditorBlock[] => {
    const name = tag(element);
    const attrs = { props: alignment(element) };
    if (ignoredTags.has(name)) return [];
    if (element.matches('[data-content-editor="gallery"], .ngs-content-editor-html-gallery')) {
      const images = children(element).flatMap(figure => {
        const image = tag(figure) === 'img' ? figure : direct(figure, 'img');
        const src = safeContentEditorHtmlUrl(image?.getAttribute('src'), 'image');
        if (!image || !src) return [];
        const caption = direct(figure, 'figcaption');
        return [{ id: createNgsHeadlessEditorId('image'), src, alt: image.getAttribute('alt') ?? '', caption: caption ? parseText(caption) : [] }];
      });
      return [createBlock('gallery', { images })];
    }
    if (element.matches('.ngs-content-editor-html-grid')) {
      const container = direct(element, '.ngs-content-editor-html-grid-cells') ?? element;
      const css = (element as HTMLElement).style;
      const columnValue = Number(element.getAttribute('data-columns') || css?.getPropertyValue('--ngs-html-grid-columns'));
      const gapValue = css?.getPropertyValue('--ngs-html-grid-gap').trim();
      const settings = { columns: [2, 3, 4].includes(columnValue) ? columnValue : 2, gap: gapValue === '12px' ? 'small' : gapValue === '36px' ? 'large' : 'medium', stackOnMobile: container.classList.contains('ngs-content-editor-html-grid-stack') };
      const cells = children(container).filter(cell => cell.matches('.ngs-content-editor-html-grid-cell')).map(cell => ({ id: createNgsHeadlessEditorId('cell'), blocks: parseBlocks(cell) }));
      return [createBlock('grid', { cells }, { settings })];
    }
    if (name === 'p' || /^h[1-6]$/.test(name)) {
      if (element.querySelector('img, video, iframe, a[download]')) return parseBlocks(element);
      return [createBlock(name === 'p' ? 'paragraph' : 'heading', parseText(element), { ...attrs, ...(name !== 'p' ? { settings: { level: Number(name[1]) } } : {}) })];
    }
    if (name === 'hr') return [createBlock('divider', null)];
    if (name === 'pre') {
      const code = direct(element, 'code') ?? element;
      const language = code.getAttribute('data-language') ?? Array.from(code.classList).find(cls => cls.startsWith('language-'))?.slice(9) ?? 'none';
      return [createBlock('code', [createNgsHeadlessEditorText(code.textContent ?? '')], { settings: { language } })];
    }
    if (name === 'ul' || name === 'ol') return [createBlock(name === 'ol' ? 'orderedList' : 'bulletList', listItems(element), { settings: { listStyle: name === 'ol' ? 'ordered' : 'bullet' } })];
    if (name === 'details') {
      const summary = direct(element, 'summary');
      const body = element.cloneNode(true) as Element;
      direct(body, 'summary')?.remove();
      return [createBlock('toggle', { title: summary ? parseText(summary) : [], blocks: parseBlocks(body) }, { settings: { expanded: element.hasAttribute('open') } })];
    }
    if (name === 'aside' && (element.hasAttribute('data-callout') || element.classList.contains('ngs-content-editor-html-callout'))) {
      const value = element.getAttribute('data-callout');
      return [createBlock('callout', parseText(element), { ...attrs, settings: { variant: ['note', 'tip', 'warning', 'danger'].includes(value ?? '') ? value : 'note' } })];
    }
    if (name === 'blockquote' || (name === 'figure' && direct(element, 'blockquote'))) {
      const quote = name === 'blockquote' ? element : direct(element, 'blockquote')!;
      const caption = name === 'figure' ? direct(element, 'figcaption') : undefined;
      return [createBlock('quote', { cite: { content: parseText(quote), props: alignment(quote) }, caption: { content: caption ? parseText(caption) : [], props: caption ? alignment(caption) : [] } })];
    }
    if (name === 'table') {
      const rows = Array.from(element.querySelectorAll('tr')).filter(row => row.closest('table') === element);
      const cells = rows.map(row => children(row).filter(cell => ['td', 'th'].includes(tag(cell))));
      return [createBlock('table', null, {
        rows: cells.map(row => row.map(parseText)), header: !!cells[0]?.some(cell => tag(cell) === 'th'),
        cellMetadata: cells.map(row => row.map(cell => ({ props: alignment(cell), options: {
          colspan: Math.max(1, Math.floor(dimension(cell, 'colspan') ?? 1)), rowspan: Math.max(1, Math.floor(dimension(cell, 'rowspan') ?? 1)),
          ...(dimension(cell, 'width') ? { width: dimension(cell, 'width') } : {})
        } })))
      })];
    }
    if (name === 'figure') {
      const child = direct(element, 'img, video, iframe');
      if (child) return media(child, element);
    }
    if (['img', 'video', 'iframe'].includes(name)) return media(element);
    if (name === 'a' && element.hasAttribute('download')) {
      const url = safeContentEditorHtmlUrl(element.getAttribute('href'), 'attachment');
      return url ? [createBlock('attachment', { url, name: element.getAttribute('download') || element.textContent?.trim() || 'Download', size: 0, mimeType: '' })] : [];
    }
    return parseBlocks(element);
  };
  const context: ContentEditorHtmlImportContext = {
    createBlock, createId: createNgsHeadlessEditorId, parseText, parseBlocks: element => parseBlocks(element),
    defaultFromHtml: builtin, safeUrl: safeContentEditorHtmlUrl
  };
  const parseElement = (element: Element): ContentEditorBlock[] => guarded(() => {
    if (ignoredTags.has(tag(element))) return [];
    for (const override of overrides) {
      if (element.matches(override.selector)) {
        const result = override.parse(element, context);
        return result === null ? [] : Array.isArray(result) ? [...result] : [result as ContentEditorBlock];
      }
    }
    return builtin(element);
  });
  const parseBlocks = (element: Element): ContentEditorBlock[] => guarded(() => {
    const output: ContentEditorBlock[] = [];
    let inline = inert.createElement('div');
    const flush = () => {
      const runs = parseText(inline);
      if (runs.some(run => run.text.trim())) output.push(createBlock('paragraph', runs, { props: alignment(element) }));
      inline = inert.createElement('div');
    };
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === 1) {
        const child = node as Element;
        if (ignoredTags.has(tag(child))) continue;
        if (blockTags.has(tag(child)) || ['img', 'video', 'iframe'].includes(tag(child)) || child.matches('a[download]') || overrides.some(override => child.matches(override.selector))) {
          flush(); output.push(...parseElement(child)); continue;
        }
        // Unknown inline wrappers may contain block elements; keep those structures.
        if (child.querySelector([...blockTags, 'img', 'video', 'iframe', 'a[download]'].join(',')) || overrides.some(override => child.querySelector(override.selector))) { flush(); output.push(...parseElement(child)); continue; }
      }
      inline.appendChild(node.cloneNode(true));
    }
    flush();
    return output;
  });
  return contentEditorFromJson({ version: 1, blocks: parseBlocks(inert.body) }, config, options);
}
