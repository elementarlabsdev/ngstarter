import { getNgsHeadlessEditorTableData } from '@ngstarter-ui/components/headless-editor';
import {
  ContentEditorBlock, ContentEditorGalleryContent, ContentEditorGridContent,
  ContentEditorListItem, ContentEditorToggleContent
} from '../types';
import { contentEditorText } from '../document';
import { getDimensionAttribute, getTextAlignment } from '../_renderer/renderer-utils';
import { contentEditorGridSettings } from '../grid-settings';
import { ContentEditorBlockHtmlConverter, ContentEditorHtmlContext } from './types';

/** Plain HTML layout styles, independent of Angular and the component library's theme. */
export const CONTENT_EDITOR_GRID_HTML_STYLES = `.ngs-content-editor-html-grid{container-type:inline-size}.ngs-content-editor-html-grid-cells{display:grid;grid-template-columns:repeat(var(--ngs-html-grid-columns),minmax(0,1fr));gap:var(--ngs-html-grid-gap)}.ngs-content-editor-html-grid-cell{min-width:0}@container(max-width:480px){.ngs-content-editor-html-grid-stack{grid-template-columns:minmax(0,1fr)}}`;
export const CONTENT_EDITOR_CALLOUT_HTML_STYLES = `.ngs-content-editor-html-callout{padding:16px;border-radius:8px;background:var(--ngs-color-primary-container,#eef3ff);color:var(--ngs-color-on-surface,#172033)}.ngs-content-editor-html-callout[data-callout=tip]{background:var(--ngs-color-success-container,#e8f5ee)}.ngs-content-editor-html-callout[data-callout=warning]{background:var(--ngs-color-warning-container,#fff3dc)}.ngs-content-editor-html-callout[data-callout=danger]{background:var(--ngs-color-danger-container,#fdeaea)}`;
export const CONTENT_EDITOR_GALLERY_HTML_STYLES = `.ngs-content-editor-html-gallery{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:16px}.ngs-content-editor-html-gallery>figure{flex:0 0 100%;min-width:0;margin:0;scroll-snap-align:start}.ngs-content-editor-html-gallery img{display:block;width:100%}`;

function settings(block: ContentEditorBlock): Record<string, any> { return block.attrs?.['settings'] as Record<string, any> ?? {}; }
function alignment(props: any): string {
  const align = getTextAlignment(props);
  return align === 'left' ? '' : ` style="text-align:${align}"`;
}
function dimension(name: string, value: unknown): string {
  const number = getDimensionAttribute(value);
  return number !== null && number > 0 ? ` ${name}="${Math.round(number)}"` : '';
}

export const contentEditorParagraphToHtml: ContentEditorBlockHtmlConverter = (block, ctx) =>
  `<p${alignment(block.attrs?.['props'])}>${ctx.renderText(block.content)}</p>`;
export const contentEditorHeadingToHtml: ContentEditorBlockHtmlConverter = (block, ctx) => {
  const value = settings(block)['level'];
  const level = Number.isInteger(value) && value >= 1 && value <= 6 ? value : 2;
  return `<h${level}${alignment(block.attrs?.['props'])}>${ctx.renderText(block.content)}</h${level}>`;
};
export const contentEditorCodeToHtml: ContentEditorBlockHtmlConverter = (block, ctx) =>
  `<pre><code data-language="${ctx.escape(settings(block)['language'] ?? 'none')}">${ctx.escape(contentEditorText(block.content))}</code></pre>`;
export const contentEditorDividerToHtml: ContentEditorBlockHtmlConverter = () => '<hr>';
export const contentEditorListToHtml: ContentEditorBlockHtmlConverter<readonly ContentEditorListItem[]> = (block, ctx) => {
  const tag = block.type === 'orderedList' ? 'ol' : 'ul';
  const list = (items: readonly ContentEditorListItem[]): string =>
    `<${tag}>${items.map(item => `<li${alignment(item.props)}>${ctx.renderText(item.content)}${item.children?.length ? list(item.children) : ''}</li>`).join('')}</${tag}>`;
  return list(block.content ?? []);
};
export const contentEditorQuoteToHtml: ContentEditorBlockHtmlConverter = (block, ctx) => {
  const quote = block.content?.cite;
  const caption = block.content?.caption;
  return `<figure><blockquote${alignment(quote?.props)}>${ctx.renderText(quote?.content ?? [])}</blockquote>${contentEditorText(caption?.content).trim() ? `<figcaption${alignment(caption.props)}>${ctx.renderText(caption.content)}</figcaption>` : ''}</figure>`;
};
export const contentEditorTableToHtml: ContentEditorBlockHtmlConverter = (block, ctx) => {
  const table = getNgsHeadlessEditorTableData(block);
  const metadata = block.attrs?.['cellMetadata'] as Array<Array<{ options?: Record<string, unknown>; props?: any }>> | undefined;
  const rows = table.rows.map((row, r) => `<tr>${row.map((runs, c) => {
    const tag = r === 0 && table.header ? 'th' : 'td';
    const cell = metadata?.[r]?.[c];
    return `<${tag}${dimension('colspan', cell?.options?.['colspan'])}${dimension('rowspan', cell?.options?.['rowspan'])}${dimension('width', cell?.options?.['width'])}${alignment(cell?.props)}>${ctx.renderText(runs)}</${tag}>`;
  }).join('')}</tr>`).join('');
  return `<table><tbody>${rows}</tbody></table>`;
};
export const contentEditorImageToHtml: ContentEditorBlockHtmlConverter = (block, ctx) => {
  const src = ctx.safeUrl(block.content?.src, 'image');
  if (!src) return '';
  const alt = block.content?.alt ?? '';
  const config = settings(block);
  return `<figure><img src="${ctx.escape(src)}" alt="${ctx.escape(alt)}"${dimension('width', config['width'])}${dimension('height', config['height'])} style="max-width:100%;height:auto">${alt ? `<figcaption>${ctx.escape(alt)}</figcaption>` : ''}</figure>`;
};
export const contentEditorVideoToHtml: ContentEditorBlockHtmlConverter = (block, ctx) => {
  const src = ctx.safeUrl(block.content?.src, 'media');
  if (!src) return '';
  const config = settings(block);
  return `<figure><video src="${ctx.escape(src)}" controls${dimension('width', config['width'])}${dimension('height', config['height'])} style="max-width:100%"></video>${block.content?.caption ? `<figcaption>${ctx.escape(block.content.caption)}</figcaption>` : ''}</figure>`;
};
export const contentEditorEmbedToHtml: ContentEditorBlockHtmlConverter = (block, ctx) => {
  const src = ctx.safeUrl(block.content?.url, 'embed');
  if (!src) return '';
  const config = settings(block);
  return `<figure><iframe src="${ctx.escape(src)}" title="${ctx.escape(block.content?.type || 'Embedded content')}"${dimension('width', config['width'] ?? 700)}${dimension('height', config['height'] ?? 400)} style="max-width:100%" allowfullscreen></iframe></figure>`;
};
export const contentEditorCalloutToHtml: ContentEditorBlockHtmlConverter = (block, ctx) => {
  ctx.addStyles(CONTENT_EDITOR_CALLOUT_HTML_STYLES);
  const value = settings(block)['variant'];
  const variant = ['note', 'tip', 'warning', 'danger'].includes(value) ? value : 'note';
  return `<aside class="ngs-content-editor-html-callout" data-callout="${variant}"${alignment(block.attrs?.['props'])}>${ctx.renderText(block.content)}</aside>`;
};
export const contentEditorToggleToHtml: ContentEditorBlockHtmlConverter<ContentEditorToggleContent> = (block, ctx) =>
  `<details${settings(block)['expanded'] ? ' open' : ''}><summary>${ctx.renderText(block.content?.title ?? [])}</summary>${ctx.renderBlocks(block.content?.blocks ?? [])}</details>`;
export const contentEditorAttachmentToHtml: ContentEditorBlockHtmlConverter = (block, ctx) => {
  const url = ctx.safeUrl(block.content?.url, 'attachment');
  return url ? `<a href="${ctx.escape(url)}" download="${ctx.escape(block.content?.name)}">${ctx.escape(block.content?.name || 'Download')}</a>` : '';
};
export const contentEditorGalleryToHtml: ContentEditorBlockHtmlConverter<ContentEditorGalleryContent> = (block, ctx) => {
  ctx.addStyles(CONTENT_EDITOR_GALLERY_HTML_STYLES);
  return `<div class="ngs-content-editor-html-gallery" data-content-editor="gallery">${(block.content?.images ?? []).map(image => {
    const src = ctx.safeUrl(image.src, 'image');
    return src ? `<figure><img src="${ctx.escape(src)}" alt="${ctx.escape(image.alt)}" style="max-width:100%;height:auto">${contentEditorText(image.caption).trim() ? `<figcaption>${ctx.renderText(image.caption)}</figcaption>` : ''}</figure>` : '';
  }).join('')}</div>`;
};
export const contentEditorGridToHtml: ContentEditorBlockHtmlConverter<ContentEditorGridContent> = (block, ctx) => {
  const layout = contentEditorGridSettings(settings(block));
  ctx.addStyles(CONTENT_EDITOR_GRID_HTML_STYLES);
  const gap = { small: 12, medium: 24, large: 36 }[layout.gap];
  return `<div class="ngs-content-editor-html-grid" style="--ngs-html-grid-columns:${layout.columns};--ngs-html-grid-gap:${gap}px"><div class="ngs-content-editor-html-grid-cells${layout.stackOnMobile ? ' ngs-content-editor-html-grid-stack' : ''}">${(block.content?.cells ?? []).map(cell => `<div class="ngs-content-editor-html-grid-cell">${ctx.renderBlocks(cell.blocks)}</div>`).join('')}</div></div>`;
};

export const CONTENT_EDITOR_DEFAULT_HTML_CONVERTERS: Readonly<Record<string, ContentEditorBlockHtmlConverter>> = {
  paragraph: contentEditorParagraphToHtml, heading: contentEditorHeadingToHtml,
  code: contentEditorCodeToHtml, divider: contentEditorDividerToHtml,
  bulletList: contentEditorListToHtml, orderedList: contentEditorListToHtml,
  quote: contentEditorQuoteToHtml, table: contentEditorTableToHtml,
  image: contentEditorImageToHtml, video: contentEditorVideoToHtml,
  embed: contentEditorEmbedToHtml, callout: contentEditorCalloutToHtml,
  toggle: contentEditorToggleToHtml, attachment: contentEditorAttachmentToHtml,
  gallery: contentEditorGalleryToHtml, grid: contentEditorGridToHtml
};
