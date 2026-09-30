import { TestBed } from '@angular/core/testing';
import {
  basicTextEditorPlugin,
  NGS_HEADLESS_EDITOR_TOGGLE_BOLD
} from './basic-text.plugin';
import {
  colorEditorPlugin,
  NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR,
  NGS_HEADLESS_EDITOR_SET_TEXT_COLOR,
  NGS_HEADLESS_EDITOR_UNSET_BACKGROUND_COLOR,
  NGS_HEADLESS_EDITOR_UNSET_TEXT_COLOR,
  normalizeNgsHeadlessEditorColor
} from './color.plugin';
import { NgsHeadlessEditor, provideNgsHeadlessEditor } from './headless-editor';
import {
  createNgsHeadlessEditorDocument,
  createNgsHeadlessEditorId,
  createNgsHeadlessEditorParagraph,
  getNgsHeadlessEditorDocumentText,
  isNgsHeadlessEditorTextContent,
  ngsHeadlessEditorDocumentsEqual,
  normalizeNgsHeadlessEditorDocument
} from './model';
import { defineNgsHeadlessEditorPlugin, withHeadlessEditorPlugin } from './plugin';

describe('NgsHeadlessEditor', () => {
  function createEditor(): NgsHeadlessEditor {
    TestBed.configureTestingModule({
      providers: [
        provideNgsHeadlessEditor(
          withHeadlessEditorPlugin(basicTextEditorPlugin()),
          withHeadlessEditorPlugin(colorEditorPlugin())
        )
      ]
    });
    return TestBed.inject(NgsHeadlessEditor);
  }

  afterEach(() => TestBed.resetTestingModule());

  it('edits a JSON document with signal state', () => {
    const editor = createEditor();

    editor.setDocument(createNgsHeadlessEditorDocument('Hello'));
    const block = editor.document().blocks[0];
    editor.setSelection({
      anchor: { blockId: block.id, offset: 5 },
      focus: { blockId: block.id, offset: 5 }
    });
    editor.insertText(' Angular');

    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('Hello Angular');
    expect(editor.revision()).toBe(2);
  });

  it('applies a stored mark to inserted text', () => {
    const editor = createEditor();
    const block = editor.document().blocks[0];
    editor.setSelection({
      anchor: { blockId: block.id, offset: 0 },
      focus: { blockId: block.id, offset: 0 }
    });

    editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);
    editor.insertText('Bold');

    const content = editor.document().blocks[0].content;
    expect(isNgsHeadlessEditorTextContent(content)).toBe(true);
    if (isNgsHeadlessEditorTextContent(content)) {
      expect(content[0].marks).toEqual([{ type: 'bold', attrs: undefined }]);
    }
  });

  it('restores snapshots with undo and redo', () => {
    const editor = createEditor();
    editor.insertText('One');
    editor.insertText(' two');

    expect(editor.undo()).toBe(true);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('One');
    expect(editor.redo()).toBe(true);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('One two');
  });

  it('sets and removes text and background colors as JSON marks', () => {
    const editor = createEditor();
    editor.setDocument(createNgsHeadlessEditorDocument('Colored'));
    const block = editor.document().blocks[0];
    editor.setSelection({
      anchor: { blockId: block.id, offset: 0 },
      focus: { blockId: block.id, offset: 7 }
    });

    expect(editor.execute(NGS_HEADLESS_EDITOR_SET_TEXT_COLOR, '#c026d3')).toBe(true);
    expect(editor.execute(NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR, 'rgb(254 249 195)')).toBe(true);

    const coloredContent = editor.document().blocks[0].content;
    expect(isNgsHeadlessEditorTextContent(coloredContent)).toBe(true);
    if (isNgsHeadlessEditorTextContent(coloredContent)) {
      expect(coloredContent[0].marks).toEqual([
        { type: 'backgroundColor', attrs: { color: 'rgb(254 249 195)' } },
        { type: 'textColor', attrs: { color: '#c026d3' } }
      ]);
    }

    expect(editor.execute(NGS_HEADLESS_EDITOR_UNSET_TEXT_COLOR)).toBe(true);
    expect(editor.execute(NGS_HEADLESS_EDITOR_UNSET_BACKGROUND_COLOR)).toBe(true);

    const plainContent = editor.document().blocks[0].content;
    expect(isNgsHeadlessEditorTextContent(plainContent)).toBe(true);
    if (isNgsHeadlessEditorTextContent(plainContent)) {
      expect(plainContent[0].marks).toEqual([]);
    }
  });

  it('rejects values that can escape an inline color declaration', () => {
    const editor = createEditor();

    expect(normalizeNgsHeadlessEditorColor('var(--ngs-color-primary)')).toBe('var(--ngs-color-primary)');
    expect(normalizeNgsHeadlessEditorColor('red; background-image: url(example)')).toBeNull();
    expect(editor.execute(NGS_HEADLESS_EDITOR_SET_TEXT_COLOR, 'red; display: none')).toBe(false);
  });

  it('deletes an adjacent atomic block from a text-block boundary', () => {
    const editor = createEditor();
    const paragraph = createNgsHeadlessEditorParagraph('Before media');
    editor.setDocument({
      version: 1,
      blocks: [
        paragraph,
        { id: createNgsHeadlessEditorId('media'), type: 'media', content: null }
      ]
    });
    editor.setSelection({
      anchor: { blockId: paragraph.id, offset: 12 },
      focus: { blockId: paragraph.id, offset: 12 }
    });

    expect(editor.deleteForward()).toBe(true);
    expect(editor.document().blocks.map(block => block.type)).toEqual(['paragraph']);
  });

  it('rejects conflicting plugin registrations with an actionable error', () => {
    const editor = createEditor();
    const duplicateMarkPlugin = defineNgsHeadlessEditorPlugin({
      id: 'duplicate-bold',
      marks: [{ type: 'bold', tagName: 'b' }]
    });

    expect(() => editor.setPlugins([
      basicTextEditorPlugin(),
      duplicateMarkPlugin
    ])).toThrowError('[NgsHeadlessEditor] Duplicate mark id "bold".');
  });

  function collapsedAt(editor: NgsHeadlessEditor, offset: number, blockIndex = 0): void {
    const block = editor.document().blocks[blockIndex];
    editor.setSelection({
      anchor: { blockId: block.id, offset },
      focus: { blockId: block.id, offset }
    });
  }

  function marksOf(editor: NgsHeadlessEditor, blockIndex = 0): string[][] {
    const content = editor.document().blocks[blockIndex].content;
    return isNgsHeadlessEditorTextContent(content) ? content.map(run => run.marks.map(mark => mark.type)) : [];
  }

  it('reports a stored mark as active at a collapsed caret', () => {
    const editor = createEditor();
    collapsedAt(editor, 0);

    editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);

    expect(editor.isMarkActive('bold')).toBe(true);
    expect(editor.storedMarks().map(mark => mark.type)).toEqual(['bold']);
  });

  it('keeps an explicit "no bold" override when toggling off inside bold text', () => {
    const editor = createEditor();
    editor.setDocument(createNgsHeadlessEditorDocument('Bold'));
    editor.setSelection({
      anchor: { blockId: editor.document().blocks[0].id, offset: 0 },
      focus: { blockId: editor.document().blocks[0].id, offset: 4 }
    });
    editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);
    collapsedAt(editor, 4);

    editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);
    expect(editor.isMarkActive('bold')).toBe(false);
    editor.insertText('x');

    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('Boldx');
    expect(marksOf(editor)).toEqual([['bold'], []]);
  });

  it('drops pending marks when the caret moves', () => {
    const editor = createEditor();
    editor.setDocument(createNgsHeadlessEditorDocument('Plain text'));
    collapsedAt(editor, 0);
    editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);

    collapsedAt(editor, 5);
    editor.insertText('!');

    expect(marksOf(editor)).toEqual([[]]);
  });

  it('merges typed characters into one undo step and splits at whitespace', () => {
    const editor = createEditor();
    for (const character of ['a', 'b', ' ', 'c']) {
      editor.insertText(character);
    }

    expect(editor.undo()).toBe(true);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('ab ');
    expect(editor.undo()).toBe(true);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('ab');
    expect(editor.undo()).toBe(true);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('');
  });

  it('starts a new undo step after the caret moves', () => {
    const editor = createEditor();
    editor.insertText('a');
    editor.insertText('b');
    collapsedAt(editor, 0);
    editor.insertText('c');

    editor.undo();
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('ab');
  });

  it('handles Mod-z, Mod-Shift-z and Mod-y without a native undo stack', () => {
    const editor = createEditor();
    editor.insertText('Hello');

    expect(editor.handleKeydown(new KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', ctrlKey: true }))).toBe(true);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('');
    expect(editor.handleKeydown(new KeyboardEvent('keydown', { key: 'Z', code: 'KeyZ', metaKey: true, shiftKey: true }))).toBe(true);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('Hello');
    editor.undo();
    expect(editor.handleKeydown(new KeyboardEvent('keydown', { key: 'y', code: 'KeyY', ctrlKey: true }))).toBe(true);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('Hello');
  });

  it('resolves bindings by physical key when the layout changes event.key', () => {
    const editor = createEditor();
    let calls = 0;
    const command = { id: 'count', execute: () => { calls += 1; return true; } };
    editor.setPlugins([
      basicTextEditorPlugin(),
      defineNgsHeadlessEditorPlugin({ id: 'shortcuts', commands: [command], keymap: [
        { key: 'Mod-Shift-7', command },
        { key: 'Mod-Alt-c', command }
      ] })
    ]);
    editor.setDocument(createNgsHeadlessEditorDocument('Text'));
    editor.setSelection({
      anchor: { blockId: editor.document().blocks[0].id, offset: 0 },
      focus: { blockId: editor.document().blocks[0].id, offset: 4 }
    });

    // US layout: Shift+7 is "&"; macOS: Option+C is "ç"; Russian layout: B is "и".
    expect(editor.handleKeydown(new KeyboardEvent('keydown', { key: '&', code: 'Digit7', ctrlKey: true, shiftKey: true }))).toBe(true);
    expect(editor.handleKeydown(new KeyboardEvent('keydown', { key: 'ç', code: 'KeyC', metaKey: true, altKey: true }))).toBe(true);
    expect(editor.handleKeydown(new KeyboardEvent('keydown', { key: 'и', code: 'KeyB', ctrlKey: true }))).toBe(true);
    expect(calls).toBe(2);
    expect(marksOf(editor)).toEqual([['bold']]);
  });

  it('deletes whole grapheme clusters', () => {
    const editor = createEditor();
    const text = 'a👍🏽👨‍👩‍👧🇬🇪';
    editor.setDocument(createNgsHeadlessEditorDocument(text));
    collapsedAt(editor, text.length);

    editor.deleteBackward();
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('a👍🏽👨‍👩‍👧');
    editor.deleteBackward();
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('a👍🏽');
    collapsedAt(editor, 1);
    editor.deleteForward();
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('a');
  });

  it('removes atomic blocks inside a replaced selection', () => {
    const editor = createEditor();
    const first = createNgsHeadlessEditorParagraph('Before');
    const last = createNgsHeadlessEditorParagraph('After');
    editor.setDocument({
      version: 1,
      blocks: [first, { id: createNgsHeadlessEditorId('media'), type: 'media', content: null }, last]
    });
    editor.setSelection({
      anchor: { blockId: first.id, offset: 3 },
      focus: { blockId: last.id, offset: 2 }
    });

    editor.insertText('X');

    expect(editor.document().blocks.map(block => block.type)).toEqual(['paragraph']);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('BefXter');
  });

  it('keeps an atomic block that only bounds the end of a selection', () => {
    const editor = createEditor();
    const first = createNgsHeadlessEditorParagraph('Before');
    const media = { id: createNgsHeadlessEditorId('media'), type: 'media', content: null };
    editor.setDocument({ version: 1, blocks: [first, media] });
    editor.setSelection({
      anchor: { blockId: first.id, offset: 0 },
      focus: { blockId: media.id, offset: 0 }
    });

    editor.insertText('X');

    expect(editor.document().blocks.map(block => block.type)).toEqual(['paragraph', 'media']);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('X\n');
  });

  it('shares unchanged blocks between revisions and history snapshots', () => {
    const editor = createEditor();
    editor.setDocument({
      version: 1,
      blocks: [createNgsHeadlessEditorParagraph('One'), createNgsHeadlessEditorParagraph('Two')]
    });
    const [first] = editor.document().blocks;
    collapsedAt(editor, 3, 1);

    editor.insertText('!');
    expect(editor.document().blocks[0]).toBe(first);

    editor.undo();
    expect(editor.document().blocks[0]).toBe(first);
  });

  it('returns the same document when it is already normalized', () => {
    const document = createNgsHeadlessEditorDocument('Stable');
    expect(normalizeNgsHeadlessEditorDocument(document)).toBe(document);
  });

  it('compares documents structurally regardless of key order', () => {
    const left = {
      version: 1 as const,
      blocks: [{
        id: 'a',
        type: 'image',
        content: null,
        attrs: { src: 'x.png', alt: 'X' }
      }]
    };
    const right = {
      version: 1 as const,
      blocks: [{
        attrs: { alt: 'X', src: 'x.png', caption: undefined },
        content: null,
        type: 'image',
        id: 'a'
      }]
    };

    expect(ngsHeadlessEditorDocumentsEqual(left, right)).toBe(true);
    expect(ngsHeadlessEditorDocumentsEqual(left, {
      ...right,
      blocks: [{ ...right.blocks[0], attrs: { alt: 'Y', src: 'x.png', caption: undefined } }]
    })).toBe(false);
  });

  function createQuoteEditor(options: { exitOnEmptyEnter?: boolean } = {}): NgsHeadlessEditor {
    const editor = createEditor();
    editor.setPlugins([
      basicTextEditorPlugin(),
      defineNgsHeadlessEditorPlugin({
        id: 'quote',
        blocks: [{
          type: 'blockquote',
          tagName: 'blockquote',
          ...options,
          create: () => ({ ...createNgsHeadlessEditorParagraph(), type: 'blockquote' })
        }]
      })
    ]);
    editor.setDocument({
      version: 1,
      blocks: [
        { ...createNgsHeadlessEditorParagraph('Quote'), type: 'blockquote' },
        createNgsHeadlessEditorParagraph('After')
      ]
    });
    collapsedAt(editor, 5);
    return editor;
  }

  it('leaves a block on the second Enter and removes the empty line', () => {
    const editor = createQuoteEditor();

    editor.splitBlock();
    expect(editor.document().blocks.map(block => block.type)).toEqual(['blockquote', 'blockquote', 'paragraph']);

    editor.splitBlock();
    const blocks = editor.document().blocks;
    expect(blocks.map(block => block.type)).toEqual(['blockquote', 'paragraph', 'paragraph']);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('Quote\n\nAfter');
    expect(editor.selection()?.focus).toEqual({ blockId: blocks[1].id, offset: 0 });

    editor.undo();
    expect(editor.document().blocks.map(block => block.type)).toEqual(['blockquote', 'blockquote', 'paragraph']);
  });

  it('keeps creating empty blocks when exitOnEmptyEnter is false', () => {
    const editor = createQuoteEditor({ exitOnEmptyEnter: false });

    editor.splitBlock();
    editor.splitBlock();

    expect(editor.document().blocks.map(block => block.type))
      .toEqual(['blockquote', 'blockquote', 'blockquote', 'paragraph']);
  });

  it('does not treat Enter in an empty paragraph as an exit', () => {
    const editor = createEditor();
    editor.splitBlock();
    editor.splitBlock();

    expect(editor.document().blocks.map(block => block.type)).toEqual(['paragraph', 'paragraph', 'paragraph']);
  });
});
