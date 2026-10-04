import { defineNgsHeadlessEditorPlugin, NgsHeadlessEditorCommand, NgsHeadlessEditorPlugin } from './plugin';

export interface NgsHeadlessEditorLink {
  readonly href: string;
  readonly target?: '_blank' | '_self';
}

/** Allows web, email, telephone and relative links; rejects executable URL schemes. */
export function normalizeNgsHeadlessEditorLink(value: string | null | undefined): string | null {
  const href = value?.trim() ?? '';
  if (!href || /[\u0000-\u0020\u007f]/.test(href)) return null;
  if (/^(https?:|mailto:|tel:)/i.test(href) || /^[/#?]/.test(href)) return href;
  if (/^[a-z][a-z\d+.-]*:/i.test(href)) return null;
  return `https://${href}`;
}

export const NGS_HEADLESS_EDITOR_SET_LINK: NgsHeadlessEditorCommand<NgsHeadlessEditorLink> = {
  id: 'set-link',
  enabled: (editor, link) => !!normalizeNgsHeadlessEditorLink(link?.href) && editor.canApplyMark('link'),
  active: editor => editor.isMarkActive('link'),
  execute: (editor, link) => {
    const href = normalizeNgsHeadlessEditorLink(link?.href);
    return !!href && editor.setMark('link', { href, target: link.target === '_blank' ? '_blank' : '_self' });
  }
};
export const NGS_HEADLESS_EDITOR_UNSET_LINK: NgsHeadlessEditorCommand = {
  id: 'unset-link',
  enabled: editor => editor.canApplyMark('link'),
  active: editor => editor.isMarkActive('link'),
  execute: editor => editor.unsetMark('link')
};

export function linkEditorPlugin(): NgsHeadlessEditorPlugin {
  return defineNgsHeadlessEditorPlugin({
    id: 'link',
    marks: [{
      type: 'link', tagName: 'a', parseTags: ['a'],
      applyAttributes: (element, mark) => {
        const href = normalizeNgsHeadlessEditorLink(String(mark.attrs?.['href'] ?? ''));
        if (href) {
          element.setAttribute('href', href);
          element.setAttribute('target', mark.attrs?.['target'] === '_blank' ? '_blank' : '_self');
          element.setAttribute('rel', 'noopener noreferrer');
        }
      },
      readAttributes: element => {
        const href = normalizeNgsHeadlessEditorLink(element.getAttribute('href'));
        return href ? { href, target: element.getAttribute('target') === '_blank' ? '_blank' : '_self' } : undefined;
      }
    }],
    commands: [NGS_HEADLESS_EDITOR_SET_LINK, NGS_HEADLESS_EDITOR_UNSET_LINK]
  });
}
