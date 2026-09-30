import { TestBed } from '@angular/core/testing';
import { basicTextEditorPlugin } from '../basic-text.plugin';
import { NgsHeadlessEditor, provideNgsHeadlessEditor } from '../headless-editor';
import { createNgsHeadlessEditorDocument, createNgsHeadlessEditorText, getNgsHeadlessEditorDocumentText } from '../model';
import { withHeadlessEditorPlugin } from '../plugin';
import {
  findNgsHeadlessEditorMentionQuery, insertNgsHeadlessEditorMention,
  mentionEditorPlugin, NGS_HEADLESS_EDITOR_MENTION_MARK
} from './mention.plugin';

describe('mentionEditorPlugin', () => {
  let editor: NgsHeadlessEditor;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(mentionEditorPlugin())
    )] });
    editor = TestBed.inject(NgsHeadlessEditor);
  });
  afterEach(() => TestBed.resetTestingModule());

  function load(text: string, offset = text.length) {
    editor.setDocument(createNgsHeadlessEditorDocument(text));
    const point = { blockId: editor.document().blocks[0].id, offset };
    editor.setSelection({ anchor: point, focus: point });
  }

  it('finds queries at text boundaries, including Unicode and custom triggers', () => {
    for (const text of ['@', 'Hello @Anna', '(@Анна', 'Hello\n@anna']) {
      load(text);
      expect(findNgsHeadlessEditorMentionQuery(editor)?.query).toBe(text.split('@')[1]);
    }
    load('Hello +[ann');
    expect(findNgsHeadlessEditorMentionQuery(editor, '+[')?.query).toBe('ann');
  });

  it('does not open for emails, ranges, read-only state or composition', () => {
    load('anna@example');
    expect(findNgsHeadlessEditorMentionQuery(editor)).toBeNull();
    load('@anna');
    const selection = editor.selection()!;
    editor.setSelection({ ...selection, anchor: { ...selection.anchor, offset: 0 } });
    expect(findNgsHeadlessEditorMentionQuery(editor)).toBeNull();
    load('@anna');
    editor.setReadOnly(true);
    expect(findNgsHeadlessEditorMentionQuery(editor)).toBeNull();
    editor.setReadOnly(false);
    editor.setComposing(true);
    expect(findNgsHeadlessEditorMentionQuery(editor)).toBeNull();
  });

  it('replaces only the query, preserves formatting and undoes selection in one step', () => {
    load('Before @an after', 10);
    const block = editor.document().blocks[0];
    editor.setDocument({ version: 1, blocks: [{ ...block, content: [createNgsHeadlessEditorText('Before @an after', [{ type: 'bold' }])] }] });
    const point = { blockId: block.id, offset: 10 };
    editor.setSelection({ anchor: point, focus: point });
    const query = findNgsHeadlessEditorMentionQuery(editor)!;
    expect(insertNgsHeadlessEditorMention(editor, { id: 'anna', label: 'Anna Chen' }, query)).toBe(true);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('Before @Anna Chen after');
    const runs = editor.document().blocks[0].content as ReturnType<typeof createNgsHeadlessEditorText>[];
    expect(runs.find(run => run.text === '@Anna Chen')?.marks).toEqual([
      { type: 'bold', attrs: undefined },
      { type: 'mention', attrs: { id: 'anna', label: 'Anna Chen' } }
    ]);
    editor.insertText('next');
    expect((editor.document().blocks[0].content as typeof runs).find(run => run.text.includes('next'))?.marks.map(mark => mark.type)).toEqual(['bold']);
    editor.undo();
    editor.undo();
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('Before @an after');
    expect(editor.selection()?.focus.offset).toBe(10);
    expect(editor.canUndo()).toBe(false);
    editor.redo();
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toContain('@Anna Chen');
  });

  it('rejects a stale query when typing or moving the caret changes its range', () => {
    load('@an');
    const query = findNgsHeadlessEditorMentionQuery(editor)!;
    editor.insertText('x');
    expect(insertNgsHeadlessEditorMention(editor, { id: 'anna', label: 'Anna' }, query)).toBe(false);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('@anx');
  });

  it('does not suggest inside an existing mention and round-trips its attributes', () => {
    load('@an');
    insertNgsHeadlessEditorMention(editor, { id: 'anna', label: 'Anna' }, findNgsHeadlessEditorMentionQuery(editor)!);
    const block = editor.document().blocks[0];
    const point = { blockId: block.id, offset: 3 };
    editor.setSelection({ anchor: point, focus: point });
    expect(findNgsHeadlessEditorMentionQuery(editor)).toBeNull();
    const definition = editor.getMarkDefinition(NGS_HEADLESS_EDITOR_MENTION_MARK)!;
    const element = document.createElement('span');
    definition.applyAttributes!(element, { type: 'mention', attrs: { id: 'anna', label: 'Anna' } });
    expect(definition.readAttributes!(element)).toEqual({ id: 'anna', label: 'Anna' });
  });
});
