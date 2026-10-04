import { normalizeNgsHeadlessEditorLink } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorHtmlUrlKind } from './types';

export function escapeContentEditorHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]!);
}

export function safeContentEditorHtmlUrl(value: unknown, kind: ContentEditorHtmlUrlKind = 'link'): string | null {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  if (!url || /[\u0000-\u0020\u007f]/.test(url)) return null;
  if (kind === 'link') return normalizeNgsHeadlessEditorLink(url);
  if (/^https?:/i.test(url) || !/^[a-z][a-z\d+.-]*:/i.test(url)) return url;
  if (kind !== 'embed' && /^blob:https?:\/\//i.test(url)) return url;
  if (kind === 'attachment' && /^(mailto:|tel:)/i.test(url)) return url;
  const mime = kind === 'image' ? 'image/[a-z0-9.+-]+' : kind === 'media'
    ? '(?:audio|video)/[a-z0-9.+-]+' : kind === 'attachment'
      ? '(?:application/(?!xhtml\\+xml|xml|javascript)[a-z0-9.+-]+|text/(?:plain|csv)|(?:image|audio|video)/[a-z0-9.+-]+)' : null;
  return mime && new RegExp(`^data:${mime};base64,[a-z0-9+/=]${kind === 'attachment' ? '*' : '+'}$`, 'i').test(url) ? url : null;
}
