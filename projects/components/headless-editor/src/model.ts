export type NgsHeadlessEditorMarkAttributes = Readonly<Record<string, string | number | boolean | null>>;

export interface NgsHeadlessEditorMark {
  readonly type: string;
  readonly attrs?: NgsHeadlessEditorMarkAttributes;
}

export interface NgsHeadlessEditorText {
  readonly type: 'text';
  readonly text: string;
  readonly marks: readonly NgsHeadlessEditorMark[];
}

export interface NgsHeadlessEditorBlock<TContent = unknown> {
  readonly id: string;
  readonly type: string;
  readonly content: TContent;
  readonly attrs?: Readonly<Record<string, unknown>>;
}

export interface NgsHeadlessEditorDocument {
  readonly version: 1;
  readonly blocks: readonly NgsHeadlessEditorBlock[];
}

export interface NgsHeadlessEditorPoint {
  readonly blockId: string;
  readonly offset: number;
}

export interface NgsHeadlessEditorSelection {
  readonly anchor: NgsHeadlessEditorPoint;
  readonly focus: NgsHeadlessEditorPoint;
}

let nextEditorId = 0;

export function createNgsHeadlessEditorId(prefix = 'block'): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) {
    return `${prefix}-${randomUuid}`;
  }

  nextEditorId += 1;
  return `${prefix}-${Date.now().toString(36)}-${nextEditorId.toString(36)}`;
}

export function createNgsHeadlessEditorText(
  text = '',
  marks: readonly NgsHeadlessEditorMark[] = []
): NgsHeadlessEditorText {
  return {
    type: 'text',
    text,
    marks: normalizeNgsHeadlessEditorMarks(marks)
  };
}

export function createNgsHeadlessEditorParagraph(
  text = '',
  marks: readonly NgsHeadlessEditorMark[] = []
): NgsHeadlessEditorBlock<readonly NgsHeadlessEditorText[]> {
  return {
    id: createNgsHeadlessEditorId('paragraph'),
    type: 'paragraph',
    content: [createNgsHeadlessEditorText(text, marks)]
  };
}

export function createNgsHeadlessEditorDocument(text = ''): NgsHeadlessEditorDocument {
  return normalizeNgsHeadlessEditorDocument({
    version: 1,
    blocks: [createNgsHeadlessEditorParagraph(text)]
  });
}

export function cloneNgsHeadlessEditorDocument(document: NgsHeadlessEditorDocument): NgsHeadlessEditorDocument {
  return {
    version: 1,
    blocks: document.blocks.map(block => ({
      ...block,
      attrs: block.attrs ? cloneBlockValue(block.attrs) : undefined,
      content: isNgsHeadlessEditorTextContent(block.content)
        ? block.content.map(run => ({
          type: 'text' as const,
          text: run.text,
          marks: run.marks.map(mark => ({
            type: mark.type,
            attrs: mark.attrs ? { ...mark.attrs } : undefined
          }))
        }))
        : cloneBlockValue(block.content)
    }))
  };
}

/**
 * Normalizes a document. The model is immutable, so unchanged blocks keep their
 * object identity; the surface relies on it to re-render only changed blocks.
 * When nothing needs fixing the input document itself is returned.
 */
export function normalizeNgsHeadlessEditorDocument(document: NgsHeadlessEditorDocument): NgsHeadlessEditorDocument {
  const usedIds = new Set<string>();
  let changed = document.version !== 1;
  const blocks = document.blocks.map(block => {
    let id = block.id || createNgsHeadlessEditorId(block.type || 'block');
    while (usedIds.has(id)) {
      id = createNgsHeadlessEditorId(block.type || 'block');
    }
    usedIds.add(id);

    const content = isNgsHeadlessEditorTextContent(block.content)
      ? normalizeNgsHeadlessEditorTextContent(block.content)
      : block.content;
    if (id === block.id && content === block.content) {
      return block;
    }
    changed = true;
    return { ...block, id, content };
  });

  if (blocks.length === 0) {
    return { version: 1, blocks: [createNgsHeadlessEditorParagraph()] };
  }
  return changed ? { version: 1, blocks } : document;
}

export function normalizeNgsHeadlessEditorTextContent(
  content: readonly NgsHeadlessEditorText[]
): readonly NgsHeadlessEditorText[] {
  if (isNormalizedTextContent(content)) {
    return content;
  }

  const normalized: NgsHeadlessEditorText[] = [];

  for (const run of content) {
    if (run.type !== 'text' || run.text.length === 0) {
      continue;
    }

    const next = createNgsHeadlessEditorText(run.text, run.marks);
    const previous = normalized.at(-1);
    if (previous && ngsHeadlessEditorMarksEqual(previous.marks, next.marks)) {
      normalized[normalized.length - 1] = {
        ...previous,
        text: previous.text + next.text
      };
    } else {
      normalized.push(next);
    }
  }

  return normalized.length > 0 ? normalized : [createNgsHeadlessEditorText()];
}

export function normalizeNgsHeadlessEditorMarks(
  marks: readonly NgsHeadlessEditorMark[]
): readonly NgsHeadlessEditorMark[] {
  if (isNormalizedMarks(marks)) {
    return marks;
  }

  const byType = new Map<string, NgsHeadlessEditorMark>();
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

export function ngsHeadlessEditorMarksEqual(
  left: readonly NgsHeadlessEditorMark[],
  right: readonly NgsHeadlessEditorMark[]
): boolean {
  if (left === right) {
    return true;
  }
  const normalizedLeft = normalizeNgsHeadlessEditorMarks(left);
  const normalizedRight = normalizeNgsHeadlessEditorMarks(right);
  return normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((mark, index) => (
      mark.type === normalizedRight[index].type &&
      ngsHeadlessEditorValuesEqual(mark.attrs, normalizedRight[index].attrs)
    ));
}

/** Structural equality of two blocks (id, type, attrs and content). */
export function ngsHeadlessEditorBlocksEqual(left: NgsHeadlessEditorBlock, right: NgsHeadlessEditorBlock): boolean {
  if (left === right) {
    return true;
  }
  if (
    left.id !== right.id ||
    left.type !== right.type ||
    !ngsHeadlessEditorValuesEqual(left.attrs, right.attrs)
  ) {
    return false;
  }
  if (isNgsHeadlessEditorTextContent(left.content) && isNgsHeadlessEditorTextContent(right.content)) {
    const rightContent = right.content;
    return left.content.length === rightContent.length &&
      left.content.every((run, index) => (
        run.text === rightContent[index].text &&
        ngsHeadlessEditorMarksEqual(run.marks, rightContent[index].marks)
      ));
  }
  return ngsHeadlessEditorValuesEqual(left.content, right.content);
}

/** Structural document equality; short-circuits on shared (unchanged) blocks. */
export function ngsHeadlessEditorDocumentsEqual(
  left: NgsHeadlessEditorDocument,
  right: NgsHeadlessEditorDocument
): boolean {
  if (left === right) {
    return true;
  }
  return left.version === right.version &&
    left.blocks.length === right.blocks.length &&
    left.blocks.every((block, index) => ngsHeadlessEditorBlocksEqual(block, right.blocks[index]));
}

/**
 * Deep equality for JSON-like values. Object key order is ignored and keys with
 * `undefined` values are treated as absent, matching JSON serialization.
 */
export function ngsHeadlessEditorValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) {
    return false;
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => ngsHeadlessEditorValuesEqual(value, right[index]));
  }
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord).filter(key => leftRecord[key] !== undefined);
  const rightKeys = Object.keys(rightRecord).filter(key => rightRecord[key] !== undefined);
  return leftKeys.length === rightKeys.length &&
    leftKeys.every(key => ngsHeadlessEditorValuesEqual(leftRecord[key], rightRecord[key]));
}

function isNormalizedMarks(marks: readonly NgsHeadlessEditorMark[]): boolean {
  for (let index = 0; index < marks.length; index += 1) {
    if (!marks[index].type) {
      return false;
    }
    if (index > 0 && marks[index - 1].type.localeCompare(marks[index].type) >= 0) {
      return false;
    }
  }
  return true;
}

function isNormalizedTextContent(content: readonly NgsHeadlessEditorText[]): boolean {
  if (content.length === 0) {
    return false;
  }
  if (content.length === 1 && content[0].type === 'text' && content[0].text.length === 0) {
    return content[0].marks.length === 0;
  }
  for (let index = 0; index < content.length; index += 1) {
    const run = content[index];
    if (run.type !== 'text' || run.text.length === 0 || !isNormalizedMarks(run.marks)) {
      return false;
    }
    if (index > 0 && ngsHeadlessEditorMarksEqual(content[index - 1].marks, run.marks)) {
      return false;
    }
  }
  return true;
}

export function isNgsHeadlessEditorTextContent(content: unknown): content is readonly NgsHeadlessEditorText[] {
  return Array.isArray(content) && content.every(run => (
    typeof run === 'object' && run !== null && (run as NgsHeadlessEditorText).type === 'text'
  ));
}

export function getNgsHeadlessEditorBlockText(block: NgsHeadlessEditorBlock): string {
  return isNgsHeadlessEditorTextContent(block.content)
    ? block.content.map(run => run.text).join('')
    : '';
}

export function getNgsHeadlessEditorDocumentText(document: NgsHeadlessEditorDocument): string {
  return document.blocks.map(getNgsHeadlessEditorBlockText).join('\n');
}

export function isNgsHeadlessEditorDocumentEmpty(document: NgsHeadlessEditorDocument): boolean {
  return getNgsHeadlessEditorDocumentText(document).trim().length === 0;
}

function cloneBlockValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map(item => cloneBlockValue(item)) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneBlockValue(item)])) as T;
  }
  return value;
}
