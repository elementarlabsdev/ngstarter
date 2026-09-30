import {
  isNgsHeadlessEditorTextContent,
  normalizeNgsHeadlessEditorColor,
  NgsHeadlessEditorBlock,
  NgsHeadlessEditorDocument,
  NgsHeadlessEditorMark,
  NgsHeadlessEditorText
} from '@ngstarter-ui/components/headless-editor';
import { normalizeLinkUrl } from './comment-editor.plugin';

export function serializeCommentEditorDocument(document: NgsHeadlessEditorDocument): string {
  if (document.blocks.every(block => (
    isNgsHeadlessEditorTextContent(block.content) &&
    block.content.every(run => run.text.trim().length === 0)
  ))) {
    return '';
  }
  return document.blocks.map(serializeBlock).filter(Boolean).join('');
}

function serializeBlock(block: NgsHeadlessEditorBlock): string {
  const text = isNgsHeadlessEditorTextContent(block.content)
    ? block.content.map(serializeText).join('')
    : '';

  switch (block.type) {
    case 'paragraph':
      return `<p>${text || '<br>'}</p>`;
    case 'blockquote':
      return `<blockquote>${text || '<br>'}</blockquote>`;
    case 'codeBlock':
      return `<pre><code>${stripInlineMarkup(text) || '<br>'}</code></pre>`;
    case 'bulletList':
      return `<ul><li>${text || '<br>'}</li></ul>`;
    case 'orderedList':
      return `<ol><li>${text || '<br>'}</li></ol>`;
    case 'image': {
      const src = escapeAttribute(String(block.attrs?.['src'] ?? ''));
      const alt = escapeAttribute(String(block.attrs?.['alt'] ?? ''));
      return src ? `<img src="${src}" alt="${alt}">` : '';
    }
    case 'youtube': {
      const src = escapeAttribute(String(block.attrs?.['src'] ?? ''));
      return src
        ? `<div data-youtube-video><iframe src="${src}" title="YouTube video" loading="lazy" allowfullscreen></iframe></div>`
        : '';
    }
    case 'imageUpload':
      return '';
    default:
      return text ? `<div data-ngs-headless-editor-block-type="${escapeAttribute(block.type)}">${text}</div>` : '';
  }
}

function serializeText(run: NgsHeadlessEditorText): string {
  let value = escapeHtml(run.text);
  for (const mark of run.marks) {
    value = wrapMark(value, mark);
  }
  return value;
}

function wrapMark(value: string, mark: NgsHeadlessEditorMark): string {
  switch (mark.type) {
    case 'bold':
      return `<strong>${value}</strong>`;
    case 'italic':
      return `<em>${value}</em>`;
    case 'strike':
      return `<s>${value}</s>`;
    case 'code':
      return `<code>${value}</code>`;
    case 'singleEmoji':
      return `<span class="single-emoji">${value}</span>`;
    case 'textColor': {
      const color = normalizeNgsHeadlessEditorColor(String(mark.attrs?.['color'] ?? ''));
      return color ? `<span style="color: ${escapeAttribute(color)}">${value}</span>` : value;
    }
    case 'backgroundColor': {
      const color = normalizeNgsHeadlessEditorColor(String(mark.attrs?.['color'] ?? ''));
      return color
        ? `<span style="background-color: ${escapeAttribute(color)}">${value}</span>`
        : value;
    }
    case 'link': {
      // The document may come from storage or an API: never trust the raw href.
      const href = escapeAttribute(normalizeLinkUrl(String(mark.attrs?.['href'] ?? '')));
      return href
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${value}</a>`
        : value;
    }
    default:
      return value;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function stripInlineMarkup(value: string): string {
  return value.replace(/<[^>]+>/g, '');
}
