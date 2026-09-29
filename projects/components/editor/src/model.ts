export type NgsEditorMarkAttributes = Readonly<Record<string, string | number | boolean | null>>;

export interface NgsEditorMark {
  readonly type: string;
  readonly attrs?: NgsEditorMarkAttributes;
}

export interface NgsEditorText {
  readonly type: 'text';
  readonly text: string;
  readonly marks: readonly NgsEditorMark[];
}

export interface NgsEditorBlock<TContent = unknown> {
  readonly id: string;
  readonly type: string;
  readonly content: TContent;
  readonly attrs?: Readonly<Record<string, unknown>>;
}

export interface NgsEditorDocument {
  readonly version: 1;
  readonly blocks: readonly NgsEditorBlock[];
}

export interface NgsEditorPoint {
  readonly blockId: string;
  readonly offset: number;
}

export interface NgsEditorSelection {
  readonly anchor: NgsEditorPoint;
  readonly focus: NgsEditorPoint;
}

let nextEditorId = 0;

export function createNgsEditorId(prefix = 'block'): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) {
    return `${prefix}-${randomUuid}`;
  }

  nextEditorId += 1;
  return `${prefix}-${Date.now().toString(36)}-${nextEditorId.toString(36)}`;
}

export function createNgsEditorText(
  text = '',
  marks: readonly NgsEditorMark[] = []
): NgsEditorText {
  return {
    type: 'text',
    text,
    marks: normalizeNgsEditorMarks(marks)
  };
}

export function createNgsEditorParagraph(
  text = '',
  marks: readonly NgsEditorMark[] = []
): NgsEditorBlock<readonly NgsEditorText[]> {
  return {
    id: createNgsEditorId('paragraph'),
    type: 'paragraph',
    content: [createNgsEditorText(text, marks)]
  };
}

export function createNgsEditorDocument(text = ''): NgsEditorDocument {
  return normalizeNgsEditorDocument({
    version: 1,
    blocks: [createNgsEditorParagraph(text)]
  });
}

export function cloneNgsEditorDocument(document: NgsEditorDocument): NgsEditorDocument {
  return {
    version: 1,
    blocks: document.blocks.map(block => ({
      ...block,
      attrs: block.attrs ? { ...block.attrs } : undefined,
      content: isNgsEditorTextContent(block.content)
        ? block.content.map(run => ({
          type: 'text' as const,
          text: run.text,
          marks: run.marks.map(mark => ({
            type: mark.type,
            attrs: mark.attrs ? { ...mark.attrs } : undefined
          }))
        }))
        : block.content
    }))
  };
}

export function normalizeNgsEditorDocument(document: NgsEditorDocument): NgsEditorDocument {
  const usedIds = new Set<string>();
  const blocks = document.blocks.map(block => {
    let id = block.id || createNgsEditorId(block.type || 'block');
    while (usedIds.has(id)) {
      id = createNgsEditorId(block.type || 'block');
    }
    usedIds.add(id);

    return {
      ...block,
      id,
      content: isNgsEditorTextContent(block.content)
        ? normalizeNgsEditorTextContent(block.content)
        : block.content
    };
  });

  return {
    version: 1,
    blocks: blocks.length > 0 ? blocks : [createNgsEditorParagraph()]
  };
}

export function normalizeNgsEditorTextContent(
  content: readonly NgsEditorText[]
): readonly NgsEditorText[] {
  const normalized: NgsEditorText[] = [];

  for (const run of content) {
    if (run.type !== 'text' || run.text.length === 0) {
      continue;
    }

    const next = createNgsEditorText(run.text, run.marks);
    const previous = normalized.at(-1);
    if (previous && ngsEditorMarksEqual(previous.marks, next.marks)) {
      normalized[normalized.length - 1] = {
        ...previous,
        text: previous.text + next.text
      };
    } else {
      normalized.push(next);
    }
  }

  return normalized.length > 0 ? normalized : [createNgsEditorText()];
}

export function normalizeNgsEditorMarks(
  marks: readonly NgsEditorMark[]
): readonly NgsEditorMark[] {
  const byType = new Map<string, NgsEditorMark>();
  for (const mark of marks) {
    if (mark.type) {
      byType.set(mark.type, {
        type: mark.type,
        attrs: mark.attrs ? { ...mark.attrs } : undefined
      });
    }
  }

  return [...byType.values()].sort((a, b) => a.type.localeCompare(b.type));
}

export function ngsEditorMarksEqual(
  left: readonly NgsEditorMark[],
  right: readonly NgsEditorMark[]
): boolean {
  return JSON.stringify(normalizeNgsEditorMarks(left)) === JSON.stringify(normalizeNgsEditorMarks(right));
}

export function ngsEditorDocumentsEqual(
  left: NgsEditorDocument,
  right: NgsEditorDocument
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function isNgsEditorTextContent(content: unknown): content is readonly NgsEditorText[] {
  return Array.isArray(content) && content.every(run => (
    typeof run === 'object' && run !== null && (run as NgsEditorText).type === 'text'
  ));
}

export function getNgsEditorBlockText(block: NgsEditorBlock): string {
  return isNgsEditorTextContent(block.content)
    ? block.content.map(run => run.text).join('')
    : '';
}

export function getNgsEditorDocumentText(document: NgsEditorDocument): string {
  return document.blocks.map(getNgsEditorBlockText).join('\n');
}

export function isNgsEditorDocumentEmpty(document: NgsEditorDocument): boolean {
  return getNgsEditorDocumentText(document).trim().length === 0;
}
