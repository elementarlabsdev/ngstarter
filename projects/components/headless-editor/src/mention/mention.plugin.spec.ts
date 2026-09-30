import { TestBed } from '@angular/core/testing';
import { basicTextEditorPlugin } from '../basic-text.plugin';
import { NgsHeadlessEditor, provideNgsHeadlessEditor } from '../headless-editor';
import { createNgsHeadlessEditorDocument, createNgsHeadlessEditorText, getNgsHeadlessEditorDocumentText } from '../model';
import { defineNgsHeadlessEditorPlugin, withHeadlessEditorPlugin } from '../plugin';
import { NGS_HEADLESS_EDITOR_MENTION_OPTIONS } from './mention.options';
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
      { type: 'mention', attrs: { id: 'anna', label: 'Anna Chen', trigger: '@', tokenId: expect.any(String) } }
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

  it('inserts exact option text instead of its trigger and label, including multi-code-point emoji', () => {
    load(':rocket');
    const query = findNgsHeadlessEditorMentionQuery(editor, ':')!;
    expect(insertNgsHeadlessEditorMention(editor, { id: 'rocket', label: 'rocket:', text: '🚀' }, query)).toBe(true);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('🚀 ');
    editor.undo();
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe(':rocket');
    load(':developer');
    insertNgsHeadlessEditorMention(editor, { id: 'dev', label: 'developer', text: '👩🏽‍💻' }, findNgsHeadlessEditorMentionQuery(editor, ':')!);
    editor.deleteBackward();
    editor.deleteBackward();
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('');
  });

  it('expands partial selections and direct deletion ranges to the whole mention', () => {
    load('Before @an after', 10);
    insertNgsHeadlessEditorMention(editor, { id: 'anna', label: 'Anna Chen' }, findNgsHeadlessEditorMentionQuery(editor)!);
    const blockId = editor.document().blocks[0].id;
    const partial = { anchor: { blockId, offset: 9 }, focus: { blockId, offset: 11 } };
    editor.setSelection(partial);
    expect(editor.selection()).toEqual({ anchor: { blockId, offset: 7 }, focus: { blockId, offset: 17 } });
    editor.insertText('replacement');
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('Before replacement after');
    editor.undo();
    editor.deleteRange(partial, 'keyboard');
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('Before  after');
  });

  it('snaps an interior caret and keeps new text outside the mention at either boundary', () => {
    load('@an');
    insertNgsHeadlessEditorMention(editor, { id: 'anna', label: 'Anna Chen' }, findNgsHeadlessEditorMentionQuery(editor)!);
    const blockId = editor.document().blocks[0].id;
    const point = { blockId, offset: 2 };
    editor.setSelection({ anchor: point, focus: point });
    expect(editor.selection()?.focus.offset).toBe(0);
    editor.insertText('before');
    const end = { blockId, offset: 16 };
    editor.setSelection({ anchor: end, focus: end });
    editor.insertText('after');
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('before@Anna Chenafter ');
    const runs = editor.document().blocks[0].content as ReturnType<typeof createNgsHeadlessEditorText>[];
    expect(runs.filter(run => run.marks.some(mark => mark.type === 'mention')).map(run => run.text)).toEqual(['@Anna Chen']);
  });

  it('deletes a mention as one token even when formatting splits it into several runs', () => {
    load('');
    const block = editor.document().blocks[0];
    const mention = { type: 'mention', attrs: { id: 'anna', label: 'Anna' } };
    editor.setDocument({ version: 1, blocks: [{ ...block, content: [
      createNgsHeadlessEditorText('@An', [mention]),
      createNgsHeadlessEditorText('na', [mention, { type: 'bold' }]),
      createNgsHeadlessEditorText(' after')
    ] }] });
    const point = { blockId: block.id, offset: 5 };
    editor.setSelection({ anchor: point, focus: point });
    editor.deleteBackward();
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe(' after');
    editor.undo();
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('@Anna after');
  });

  it('keeps adjacent identical mentions independently deletable', () => {
    load(':rocket');
    const option = { id: 'rocket', label: 'rocket:', text: '🚀' };
    insertNgsHeadlessEditorMention(editor, option, findNgsHeadlessEditorMentionQuery(editor, ':')!);
    editor.insertText(':rocket');
    insertNgsHeadlessEditorMention(editor, option, findNgsHeadlessEditorMentionQuery(editor, ':')!);
    const blockId = editor.document().blocks[0].id;
    editor.deleteRange({ anchor: { blockId, offset: 2 }, focus: { blockId, offset: 3 } }, 'keyboard');
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('🚀🚀 ');
    const point = { blockId, offset: 4 };
    editor.setSelection({ anchor: point, focus: point });
    editor.deleteBackward();
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('🚀 ');
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
    definition.applyAttributes!(element, { type: 'mention', attrs: { id: 'anna', label: 'Anna', trigger: ':' } });
    expect(definition.readAttributes!(element)).toEqual({ id: 'anna', label: 'Anna', trigger: ':' });
    definition.applyAttributes!(element, { type: 'mention', attrs: { id: 'anna', label: 'Anna', tokenId: 'token-1' } });
    expect(definition.readAttributes!(element)).toEqual({ id: 'anna', label: 'Anna', tokenId: 'token-1' });
    definition.applyAttributes!(element, { type: 'mention', attrs: { id: 'anna', label: 'Anna' } });
    expect(element.hasAttribute('data-mention-trigger')).toBe(false);
    expect(element.hasAttribute('data-mention-token-id')).toBe(false);
  });

  it('keeps independent registrations and one shared mark for different triggers', () => {
    TestBed.resetTestingModule();
    const users = async () => [{ id: 'same-id', label: 'Anna' }];
    const emoji = async () => [{ id: 'same-id', label: 'smile' }];
    TestBed.configureTestingModule({ providers: [provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(mentionEditorPlugin([
        { trigger: '@', options: users },
        { trigger: ':', options: emoji },
        { trigger: '/' }
      ]))
    )] });
    editor = TestBed.inject(NgsHeadlessEditor);
    expect(TestBed.inject(NGS_HEADLESS_EDITOR_MENTION_OPTIONS).map(config => config.trigger)).toEqual(['@', ':', '/']);
    expect(TestBed.inject(NGS_HEADLESS_EDITOR_MENTION_OPTIONS).map(config => config.options)).toEqual([users, emoji, undefined]);
    expect(editor.getMarkDefinitions().filter(mark => mark.type === 'mention')).toHaveLength(1);
    for (const trigger of ['@', ':', '/']) {
      load(trigger + 'an');
      expect(insertNgsHeadlessEditorMention(editor, { id: 'same-id', label: 'Anna' }, findNgsHeadlessEditorMentionQuery(editor, trigger)!)).toBe(true);
      const runs = editor.document().blocks[0].content as ReturnType<typeof createNgsHeadlessEditorText>[];
      expect(runs[0].marks[0].attrs).toEqual({ id: 'same-id', label: 'Anna', trigger, tokenId: expect.any(String) });
    }
  });

  it('rejects repeated triggers and conflicting mention definitions', () => {
    expect(() => mentionEditorPlugin([{}, { trigger: '@' }]))
      .toThrowError('[NgsHeadlessEditor] Duplicate mention trigger "@".');
    expect(() => editor.setPlugins([mentionEditorPlugin(), mentionEditorPlugin({ trigger: ':' })]))
      .toThrowError('[NgsHeadlessEditor] Duplicate plugin id "mention".');
    expect(() => editor.setPlugins([
      mentionEditorPlugin(),
      defineNgsHeadlessEditorPlugin({ id: 'conflict', marks: [{ type: 'mention', tagName: 'a' }] })
    ])).toThrowError('[NgsHeadlessEditor] Duplicate mark id "mention".');
    for (const trigger of ['', ' ', '@ ']) {
      expect(() => mentionEditorPlugin({ trigger })).toThrowError(/Mention trigger/);
    }
  });
});
