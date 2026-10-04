import {
  isNgsHeadlessEditorTextContent, normalizeNgsHeadlessEditorColor, NgsHeadlessEditorMark
} from '@ngstarter-ui/components/headless-editor';
import { ContentEditorBlock, ContentEditorDocument, ContentEditorText } from '../types';
import { ContentEditorConfig } from '../config';
import { CONTENT_EDITOR_DEFAULT_HTML_CONVERTERS } from './default-converters';
import { ContentEditorHtmlContext } from './types';
import { escapeContentEditorHtml, safeContentEditorHtmlUrl } from './html-utils';

const MARK_TAGS: Readonly<Record<string, string>> = {
  bold: 'strong', italic: 'em', strike: 's', underline: 'u', code: 'code', superscript: 'sup', subscript: 'sub'
};

/** Pure document export: works without DOM, Angular DI, or a mounted editor. */
export function contentEditorToHtml(document: ContentEditorDocument, config: ContentEditorConfig = {}): string {
  return serialize(document.blocks, config);
}
export function contentEditorBlockToHtml(block: ContentEditorBlock, config: ContentEditorConfig = {}): string {
  return serialize([block], config);
}

function serialize(blocks: readonly ContentEditorBlock[], config: ContentEditorConfig): string {
  const styles = new Set<string>();
  const context: ContentEditorHtmlContext = {
    escape: escapeContentEditorHtml,
    safeUrl: safeContentEditorHtmlUrl,
    addStyles: css => { if (config.includeStyles !== false) styles.add(css); },
    renderBlock: block => {
      const converter = config.blocks?.[block.type]?.toHtml ?? defaultConverter(block.type) ?? config.unknownBlockToHtml;
      if (!converter) throw new Error(`No HTML converter for Content Editor block "${block.type}".`);
      return converter(block, context);
    },
    renderBlocks: children => children.map(context.renderBlock).join(''),
    defaultToHtml: block => {
      const converter = defaultConverter(block.type);
      if (!converter) throw new Error(`No default HTML converter for Content Editor block "${block.type}".`);
      return converter(block, context);
    },
    renderText: text => renderText(text, context, config)
  };
  const html = context.renderBlocks(blocks);
  return [...styles].map(css => `<style>${css}</style>`).join('') + html;
}

function renderText(text: ContentEditorText, ctx: ContentEditorHtmlContext, config: ContentEditorConfig): string {
  if (!isNgsHeadlessEditorTextContent(text)) return '';
  return text.map(run => run.marks.reduce((html, mark) => {
    const override = config.marks && Object.hasOwn(config.marks, mark.type) ? config.marks[mark.type] : undefined;
    return override ? override(html, mark, ctx) : renderMark(html, mark, ctx);
  }, ctx.escape(run.text).replace(/\r\n|\r|\n/g, '<br>'))).join('');
}

function renderMark(html: string, mark: NgsHeadlessEditorMark, ctx: ContentEditorHtmlContext): string {
  const tag = Object.hasOwn(MARK_TAGS, mark.type) ? MARK_TAGS[mark.type] : undefined;
  if (tag) return `<${tag}>${html}</${tag}>`;
  if (mark.type === 'link') {
    const href = ctx.safeUrl(mark.attrs?.['href']);
    if (!href) return html;
    const target = mark.attrs?.['target'] === '_blank' ? '_blank' : '_self';
    return `<a href="${ctx.escape(href)}" target="${target}" rel="noopener noreferrer">${html}</a>`;
  }
  if (mark.type === 'textColor' || mark.type === 'backgroundColor') {
    const color = normalizeNgsHeadlessEditorColor(String(mark.attrs?.['color'] ?? ''));
    return color ? `<span style="${mark.type === 'textColor' ? 'color' : 'background-color'}:${ctx.escape(color)}">${html}</span>` : html;
  }
  return html;
}

function defaultConverter(type: string) {
  return Object.hasOwn(CONTENT_EDITOR_DEFAULT_HTML_CONVERTERS, type) ? CONTENT_EDITOR_DEFAULT_HTML_CONVERTERS[type] : undefined;
}
