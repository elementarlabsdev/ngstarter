import {
  getNgsHeadlessEditorTableData, isNgsHeadlessEditorTextContent, NgsHeadlessEditorBlock
} from '@ngstarter-ui/components/headless-editor';
import { ContentEditorBlockScope, ContentEditorBlockView, ContentEditorText } from './types';

/** Plain text used by empty states and literal code editing. */
export function contentEditorText(value: ContentEditorText | unknown): string {
  return isNgsHeadlessEditorTextContent(value) ? value.map(run => run.text).join('') : '';
}

/** Maps a native block to the existing UI inputs. Saved data always stays native. */
export function contentEditorBlockView(block: NgsHeadlessEditorBlock): ContentEditorBlockView {
  return {
    id: block.id, type: block.type, content: block.type === 'table' ? contentEditorTableCells(block) : cloneContentEditorValue(block.content),
    attrs: cloneContentEditorValue(block.attrs),
    settings: cloneContentEditorValue(block.attrs?.['settings'] ?? {}),
    props: cloneContentEditorValue(block.attrs?.['props'] ?? []) as ContentEditorBlockView['props'],
    isEmpty: isContentEditorBlockEmpty(block)
  };
}

export function contentEditorNativeBlock(block: ContentEditorBlockView): NgsHeadlessEditorBlock {
  const attrs = {
    ...cloneContentEditorValue(block.attrs),
    settings: cloneContentEditorValue(block.settings), props: cloneContentEditorValue(block.props ?? [])
  };
  if (block.type === 'table') {
    const cells = cloneContentEditorValue(block.content) as Array<Array<Record<string, any>>>;
    return {
      id: block.id, type: 'table', content: null,
      attrs: {
        ...attrs,
        rows: cells.map(row => row.map(cell => cell['content'])),
        header: block.attrs?.['header'] === true,
        cellMetadata: cells.map(row => row.map(({ content, ...metadata }) => metadata))
      }
    };
  }
  return { id: block.id, type: block.type, content: cloneContentEditorValue(block.content), attrs };
}

/** Text rows use the headless table schema; content-builder cell settings stay in metadata. */
function contentEditorTableCells(block: NgsHeadlessEditorBlock): unknown[][] {
  const table = getNgsHeadlessEditorTableData(block);
  const metadata = block.attrs?.['cellMetadata'] as Array<Array<Record<string, unknown>>> | undefined;
  return table.rows.map((row, r) => row.map((content, c) => {
    const cell: any = metadata?.[r]?.[c] ?? {};
    return {
      ...cloneContentEditorValue(cell), content: cloneContentEditorValue(content),
      props: cloneContentEditorValue(cell.props ?? []),
      options: { colspan: 1, rowspan: 1, ...cloneContentEditorValue(cell.options ?? {}) }
    };
  }));
}

export function isContentEditorBlockEmpty(block: NgsHeadlessEditorBlock): boolean {
  const content: any = block.content;
  if (isNgsHeadlessEditorTextContent(content)) return !contentEditorText(content).trim();
  switch (block.type) {
    case 'bulletList': case 'orderedList': return !(content ?? []).some((item: any) =>
      contentEditorText(item.content).trim() || !isContentEditorBlockEmpty({ ...block, content: item.children }));
    case 'table': return !getNgsHeadlessEditorTableData(block).rows.some(row => row.some(cell => contentEditorText(cell).trim()));
    case 'quote': return !contentEditorText(content?.cite?.content).trim() && !contentEditorText(content?.caption?.content).trim();
    case 'image': case 'video': return !content?.src;
    case 'embed': return !content?.url;
    case 'attachment': return !content?.url;
    case 'gallery': return !(content?.images ?? []).some((image: any) => image.src);
    case 'toggle': return !contentEditorText(content?.title).trim() && (content?.blocks ?? []).every(isContentEditorBlockEmpty);
    case 'grid': return (content?.cells ?? []).every((cell: any) => cell.blocks.every(isContentEditorBlockEmpty));
    case 'divider': return false;
    default: return content == null;
  }
}

export function contentEditorChildCollections(block: NgsHeadlessEditorBlock): readonly (readonly NgsHeadlessEditorBlock[])[] {
  if (block.type === 'toggle') return [(block.content as any)?.blocks ?? []];
  if (block.type === 'grid') return ((block.content as any)?.cells ?? []).map((cell: any) => cell.blocks);
  return [];
}

export function findContentEditorBlock(blocks: readonly NgsHeadlessEditorBlock[], id: string): NgsHeadlessEditorBlock | undefined {
  for (const block of blocks) {
    if (block.id === id) return block;
    for (const children of contentEditorChildCollections(block)) {
      const found = findContentEditorBlock(children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function contentEditorCollection(blocks: readonly NgsHeadlessEditorBlock[], scope: ContentEditorBlockScope): readonly NgsHeadlessEditorBlock[] {
  if (!scope.parentId) return blocks;
  const parent = findContentEditorBlock(blocks, scope.parentId);
  if (parent?.type === 'toggle') return (parent.content as any).blocks;
  if (parent?.type === 'grid') return (parent.content as any).cells.find((cell: any) => cell.id === scope.cellId)?.blocks ?? [];
  return [];
}

/** Update only on a cloned document; callers preserve immutable undo snapshots. */
export function replaceContentEditorCollection(blocks: NgsHeadlessEditorBlock[], scope: ContentEditorBlockScope, value: readonly NgsHeadlessEditorBlock[]): void {
  if (!scope.parentId) { blocks.splice(0, blocks.length, ...value); return; }
  const parent = findContentEditorBlock(blocks, scope.parentId);
  if (parent?.type === 'toggle') (parent.content as any).blocks = value;
  if (parent?.type === 'grid') {
    const cell = (parent.content as any).cells.find((cell: any) => cell.id === scope.cellId);
    if (cell) cell.blocks = value;
  }
}

/** Mutable UI payloads must not mutate saved documents or undo snapshots. */
export function cloneContentEditorValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map(item => cloneContentEditorValue(item)) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneContentEditorValue(item)])) as T;
  }
  return value;
}
