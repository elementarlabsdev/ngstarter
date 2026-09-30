import type { NgsHeadlessEditor } from '../headless-editor';
import {
  createNgsHeadlessEditorText,
  getNgsHeadlessEditorBlockText,
  isNgsHeadlessEditorTextContent,
  NgsHeadlessEditorText,
  normalizeNgsHeadlessEditorTextContent
} from '../model';
import { defineNgsHeadlessEditorPlugin, NgsHeadlessEditorPlugin } from '../plugin';
import { NGS_HEADLESS_EDITOR_MENTION_OPTIONS, NgsHeadlessEditorMentionPluginOptions } from './mention.options';

export const NGS_HEADLESS_EDITOR_MENTION_MARK = 'mention';

/** Extend this interface with avatar, description or other menu presentation data. */
export interface NgsHeadlessEditorMentionOption {
  readonly id: string;
  readonly label: string;
}

export interface NgsHeadlessEditorMentionQuery {
  readonly blockId: string;
  readonly from: number;
  readonly to: number;
  readonly query: string;
  readonly trigger: string;
}

/** Registers an editable inline mention. Its identity is stored separately from its label. */
export function mentionEditorPlugin<TOption extends NgsHeadlessEditorMentionOption = NgsHeadlessEditorMentionOption>(
  options: NgsHeadlessEditorMentionPluginOptions<TOption> = {}
): NgsHeadlessEditorPlugin {
  return defineNgsHeadlessEditorPlugin({
    id: 'mention',
    providers: [{ provide: NGS_HEADLESS_EDITOR_MENTION_OPTIONS, useValue: options }],
    marks: [{
      type: NGS_HEADLESS_EDITOR_MENTION_MARK,
      tagName: 'span',
      applyAttributes: (element, mark) => {
        element.classList.add('ngs-headless-editor-mention');
        element.dataset['mentionId'] = String(mark.attrs?.['id'] ?? '');
        element.dataset['mentionLabel'] = String(mark.attrs?.['label'] ?? '');
      },
      readAttributes: element => ({
        id: element.dataset['mentionId'] ?? '',
        label: element.dataset['mentionLabel'] ?? ''
      })
    }]
  });
}

/** Finds @query at a collapsed caret, excluding e-mail addresses and existing mentions. */
export function findNgsHeadlessEditorMentionQuery(
  editor: NgsHeadlessEditor,
  trigger = '@'
): NgsHeadlessEditorMentionQuery | null {
  const selection = editor.selection();
  if (
    !trigger || /\s/.test(trigger) || editor.readOnly() || editor.composing() ||
    !editor.canApplyMark(NGS_HEADLESS_EDITOR_MENTION_MARK) || !selection ||
    selection.anchor.blockId !== selection.focus.blockId ||
    selection.anchor.offset !== selection.focus.offset
  ) {
    return null;
  }
  const block = editor.document().blocks.find(item => item.id === selection.focus.blockId);
  if (!block || !isNgsHeadlessEditorTextContent(block.content)) {
    return null;
  }
  const escaped = trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const before = getNgsHeadlessEditorBlockText(block).slice(0, selection.focus.offset);
  const match = new RegExp(`(?:^|[\\s([{])(${escaped}([\\p{L}\\p{N}_.-]{0,64}))$`, 'u').exec(before);
  if (!match) {
    return null;
  }
  const from = before.length - match[1].length;
  const to = before.length;
  if (sliceRuns(block.content, from, to).some(run => run.marks.some(mark => mark.type === NGS_HEADLESS_EDITOR_MENTION_MARK))) {
    return null;
  }
  return { blockId: block.id, from, to, query: match[2], trigger };
}

/** Replaces the current trigger/query with a mention and a plain space in one undo step. */
export function insertNgsHeadlessEditorMention(
  editor: NgsHeadlessEditor,
  option: NgsHeadlessEditorMentionOption,
  query: NgsHeadlessEditorMentionQuery
): boolean {
  const current = findNgsHeadlessEditorMentionQuery(editor, query.trigger);
  if (!option.id || !option.label || !current ||
    current.blockId !== query.blockId || current.from !== query.from ||
    current.to !== query.to || current.query !== query.query) {
    return false;
  }
  const block = editor.document().blocks.find(item => item.id === query.blockId)!;
  if (!isNgsHeadlessEditorTextContent(block.content)) {
    return false;
  }
  const marks = sliceRuns(block.content, query.from, query.to)[0]?.marks ?? [];
  const label = query.trigger + option.label;
  const after = sliceRuns(block.content, query.to, getNgsHeadlessEditorBlockText(block).length);
  const space = after[0]?.text.startsWith(' ') ? [] : [createNgsHeadlessEditorText(' ', marks)];
  const content = normalizeNgsHeadlessEditorTextContent([
    ...sliceRuns(block.content, 0, query.from),
    createNgsHeadlessEditorText(label, [
      ...marks,
      { type: NGS_HEADLESS_EDITOR_MENTION_MARK, attrs: { id: option.id, label: option.label } }
    ]),
    ...space,
    ...after
  ]);
  const point = { blockId: block.id, offset: query.from + label.length + 1 };
  return editor.replaceBlock(block.id, [{ ...block, content }], { anchor: point, focus: point });
}

function sliceRuns(runs: readonly NgsHeadlessEditorText[], from: number, to: number): NgsHeadlessEditorText[] {
  const result: NgsHeadlessEditorText[] = [];
  let offset = 0;
  for (const run of runs) {
    const start = Math.max(from, offset);
    const end = Math.min(to, offset + run.text.length);
    if (start < end) {
      result.push(createNgsHeadlessEditorText(run.text.slice(start - offset, end - offset), run.marks));
    }
    offset += run.text.length;
  }
  return result;
}
