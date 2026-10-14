import { createNgsHeadlessEditorText, normalizeNgsHeadlessEditorTextContent } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorBlock, ContentEditorItemProperty, ContentEditorText } from './types';
import { cloneContentEditorValue } from './document';

export type ContentEditorConvertibleBlockType = 'paragraph' | 'heading' | 'quote' | 'callout';
export const CONTENT_EDITOR_CONVERTIBLE_BLOCKS: readonly ContentEditorConvertibleBlockType[] = ['paragraph', 'heading', 'quote', 'callout'];

/** Retains identity, rich text and alignment. Quote attribution becomes a final line. */
export function contentEditorConvertBlock(block: ContentEditorBlock, type: ContentEditorConvertibleBlockType, settings: Readonly<Record<string, unknown>> = {}): ContentEditorBlock {
  if (!CONTENT_EDITOR_CONVERTIBLE_BLOCKS.includes(block.type as ContentEditorConvertibleBlockType) || !CONTENT_EDITOR_CONVERTIBLE_BLOCKS.includes(type)) {
    throw new Error(`Cannot convert ${block.type} to ${type}`);
  }
  if (type === 'heading' && settings['level'] !== undefined && ![1, 2, 3, 4, 5, 6].includes(settings['level'] as number)) throw new Error('Heading level must be between 1 and 6');
  if (type === 'callout' && settings['variant'] !== undefined && !['note', 'tip', 'warning', 'danger'].includes(settings['variant'] as string)) throw new Error('Unsupported callout variant');
  const next = cloneContentEditorValue(block);
  if (type === block.type) return { ...next, attrs: { ...next.attrs, settings: { ...next.attrs?.['settings'] as object, ...settings } } };
  const quote: any = block.type === 'quote' ? block.content : null;
  const cite: ContentEditorText = quote ? quote.cite.content : block.content as ContentEditorText;
  const caption: ContentEditorText = quote?.caption?.content ?? [];
  const text = normalizeNgsHeadlessEditorTextContent(caption.some(run => run.text)
    ? [...cite, createNgsHeadlessEditorText('\n'), ...caption] : cite);
  const props = (quote?.cite.props ?? block.attrs?.['props'] ?? []) as ContentEditorItemProperty[];
  const defaults = type === 'heading' ? { level: 2 } : type === 'callout' ? { variant: 'note' } : {};
  return { ...next, type,
    content: type === 'quote' ? { cite: { content: text, props }, caption: { content: [], props: [] } } : text,
    attrs: { ...next.attrs, props, settings: { ...defaults, ...(type === block.type ? next.attrs?.['settings'] as object : {}), ...settings } }
  };
}
