import { createNgsHeadlessEditorText, isNgsHeadlessEditorTextContent, normalizeNgsHeadlessEditorTextContent } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorBlock, ContentEditorText } from '../types';

/** Text fields use the same HTML parser as documents, flattening structure to lines. */
export function contentEditorImportedText(blocks: readonly ContentEditorBlock[]): ContentEditorText {
  const parts: ContentEditorText[] = [];
  const read = (block: ContentEditorBlock): void => {
    const content: any = block.content;
    if (isNgsHeadlessEditorTextContent(content)) parts.push(content);
    else if (block.type === 'quote') { parts.push(content.cite.content, content.caption.content); }
    else if (block.type === 'bulletList' || block.type === 'orderedList') {
      const item = (value: any) => { parts.push(value.content); value.children?.forEach(item); };
      content.forEach(item);
    } else if (block.type === 'table') {
      for (const row of (block.attrs?.['rows'] as ContentEditorText[][] ?? [])) parts.push(row.flatMap((cell, i) => i ? [createNgsHeadlessEditorText('\t'), ...cell] : cell));
    } else if (block.type === 'toggle') { parts.push(content.title); content.blocks.forEach(read); }
    else if (block.type === 'grid') content.cells.forEach((cell: any) => cell.blocks.forEach(read));
    else if (block.type === 'image' || block.type === 'gallery') parts.push([createNgsHeadlessEditorText(content.alt ?? '')]);
  };
  blocks.forEach(read);
  return normalizeNgsHeadlessEditorTextContent(parts.filter(part => part.some(run => run.text)).flatMap((part, i) => i ? [createNgsHeadlessEditorText('\n'), ...part] : part));
}
