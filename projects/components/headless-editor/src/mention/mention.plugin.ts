import type { NgsHeadlessEditor } from '../headless-editor';
import {
  createNgsHeadlessEditorText,
  createNgsHeadlessEditorId,
  getNgsHeadlessEditorBlockText,
  isNgsHeadlessEditorTextContent,
  NgsHeadlessEditorText,
  normalizeNgsHeadlessEditorTextContent
} from '../model';
import { defineNgsHeadlessEditorPlugin, NgsHeadlessEditorMarkDefinition, NgsHeadlessEditorPlugin } from '../plugin';
import { NGS_HEADLESS_EDITOR_MENTION_OPTIONS, NgsHeadlessEditorMentionPluginOptions } from './mention.options';

export const NGS_HEADLESS_EDITOR_MENTION_MARK = 'mention';

// All registrations share one mark definition, while searches and option renderers
// belong to their individual trigger. Existing documents without a trigger remain valid.
const mentionMark: NgsHeadlessEditorMarkDefinition = {
  type: NGS_HEADLESS_EDITOR_MENTION_MARK,
  tagName: 'span',
  atomic: true,
  applyAttributes: (element, mark) => {
    element.classList.add('ngs-headless-editor-mention');
    element.dataset['mentionId'] = String(mark.attrs?.['id'] ?? '');
    element.dataset['mentionLabel'] = String(mark.attrs?.['label'] ?? '');
    const trigger = mark.attrs?.['trigger'];
    if (typeof trigger === 'string') element.dataset['mentionTrigger'] = trigger;
    else delete element.dataset['mentionTrigger'];
    const tokenId = mark.attrs?.['tokenId'];
    if (typeof tokenId === 'string') element.dataset['mentionTokenId'] = tokenId;
    else delete element.dataset['mentionTokenId'];
  },
  readAttributes: element => ({
    id: element.dataset['mentionId'] ?? '',
    label: element.dataset['mentionLabel'] ?? '',
    ...(element.dataset['mentionTrigger'] !== undefined ? { trigger: element.dataset['mentionTrigger'] } : {}),
    ...(element.dataset['mentionTokenId'] !== undefined ? { tokenId: element.dataset['mentionTokenId'] } : {})
  })
};

/** Extend this interface with avatar, description or other menu presentation data. */
export interface NgsHeadlessEditorMentionOption {
  readonly id: string;
  readonly label: string;
  /** Exact text to insert (for example an emoji). Defaults to trigger + label. */
  readonly text?: string;
}

export interface NgsHeadlessEditorMentionQuery {
  readonly blockId: string;
  readonly from: number;
  readonly to: number;
  readonly query: string;
  readonly trigger: string;
}

/** One plugin accepts independently configured triggers with their own option components. */
export function mentionEditorPlugin<TOption extends NgsHeadlessEditorMentionOption = NgsHeadlessEditorMentionOption>(
  options?: NgsHeadlessEditorMentionPluginOptions<TOption>
): NgsHeadlessEditorPlugin;
export function mentionEditorPlugin(
  options: readonly NgsHeadlessEditorMentionPluginOptions[]
): NgsHeadlessEditorPlugin;
export function mentionEditorPlugin(
  options: NgsHeadlessEditorMentionPluginOptions | readonly NgsHeadlessEditorMentionPluginOptions[] = {}
): NgsHeadlessEditorPlugin {
  const configurations: readonly NgsHeadlessEditorMentionPluginOptions[] = Array.isArray(options)
    ? options : [options as NgsHeadlessEditorMentionPluginOptions];
  const triggers = new Set<string>();
  const registrations = configurations.map(config => {
    const trigger = config.trigger ?? '@';
    if (!trigger || /\s/.test(trigger)) {
      throw new Error('[NgsHeadlessEditor] Mention trigger must be non-empty and contain no whitespace.');
    }
    if (triggers.has(trigger)) {
      throw new Error(`[NgsHeadlessEditor] Duplicate mention trigger "${trigger}".`);
    }
    triggers.add(trigger);
    return { ...config, trigger };
  });
  return defineNgsHeadlessEditorPlugin({
    id: 'mention',
    providers: [{ provide: NGS_HEADLESS_EDITOR_MENTION_OPTIONS, useValue: registrations }],
    marks: [mentionMark]
  });
}

/** Finds trigger/query at a collapsed caret, excluding e-mail addresses and existing mentions. */
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
  const label = option.text ?? query.trigger + option.label;
  if (!label || /[\r\n]/.test(label)) return false;
  const after = sliceRuns(block.content, query.to, getNgsHeadlessEditorBlockText(block).length);
  const space = after[0]?.text.startsWith(' ') ? [] : [createNgsHeadlessEditorText(' ', marks)];
  const content = normalizeNgsHeadlessEditorTextContent([
    ...sliceRuns(block.content, 0, query.from),
    createNgsHeadlessEditorText(label, [
      ...marks,
      {
        type: NGS_HEADLESS_EDITOR_MENTION_MARK,
        attrs: { id: option.id, label: option.label, trigger: query.trigger, tokenId: createNgsHeadlessEditorId('mention') }
      }
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
