import { TestBed } from '@angular/core/testing';
import {
  basicTextEditorPlugin,
  NGS_EDITOR_TOGGLE_BOLD
} from './basic-text.plugin';
import {
  colorEditorPlugin,
  NGS_EDITOR_SET_BACKGROUND_COLOR,
  NGS_EDITOR_SET_TEXT_COLOR,
  NGS_EDITOR_UNSET_BACKGROUND_COLOR,
  NGS_EDITOR_UNSET_TEXT_COLOR,
  normalizeNgsEditorColor
} from './color.plugin';
import { NgsEditor, provideNgsEditor } from './editor';
import {
  createNgsEditorDocument,
  createNgsEditorId,
  createNgsEditorParagraph,
  getNgsEditorDocumentText,
  isNgsEditorTextContent
} from './model';
import { defineNgsEditorPlugin, withEditorPlugin } from './plugin';

describe('NgsEditor', () => {
  function createEditor(): NgsEditor {
    TestBed.configureTestingModule({
      providers: [
        provideNgsEditor(
          withEditorPlugin(basicTextEditorPlugin()),
          withEditorPlugin(colorEditorPlugin())
        )
      ]
    });
    return TestBed.inject(NgsEditor);
  }

  afterEach(() => TestBed.resetTestingModule());

  it('edits a JSON document with signal state', () => {
    const editor = createEditor();

    editor.setDocument(createNgsEditorDocument('Hello'));
    const block = editor.document().blocks[0];
    editor.setSelection({
      anchor: { blockId: block.id, offset: 5 },
      focus: { blockId: block.id, offset: 5 }
    });
    editor.insertText(' Angular');

    expect(getNgsEditorDocumentText(editor.document())).toBe('Hello Angular');
    expect(editor.revision()).toBe(2);
  });

  it('applies a stored mark to inserted text', () => {
    const editor = createEditor();
    const block = editor.document().blocks[0];
    editor.setSelection({
      anchor: { blockId: block.id, offset: 0 },
      focus: { blockId: block.id, offset: 0 }
    });

    editor.execute(NGS_EDITOR_TOGGLE_BOLD);
    editor.insertText('Bold');

    const content = editor.document().blocks[0].content;
    expect(isNgsEditorTextContent(content)).toBe(true);
    if (isNgsEditorTextContent(content)) {
      expect(content[0].marks).toEqual([{ type: 'bold', attrs: undefined }]);
    }
  });

  it('restores snapshots with undo and redo', () => {
    const editor = createEditor();
    editor.insertText('One');
    editor.insertText(' two');

    expect(editor.undo()).toBe(true);
    expect(getNgsEditorDocumentText(editor.document())).toBe('One');
    expect(editor.redo()).toBe(true);
    expect(getNgsEditorDocumentText(editor.document())).toBe('One two');
  });

  it('sets and removes text and background colors as JSON marks', () => {
    const editor = createEditor();
    editor.setDocument(createNgsEditorDocument('Colored'));
    const block = editor.document().blocks[0];
    editor.setSelection({
      anchor: { blockId: block.id, offset: 0 },
      focus: { blockId: block.id, offset: 7 }
    });

    expect(editor.execute(NGS_EDITOR_SET_TEXT_COLOR, '#c026d3')).toBe(true);
    expect(editor.execute(NGS_EDITOR_SET_BACKGROUND_COLOR, 'rgb(254 249 195)')).toBe(true);

    const coloredContent = editor.document().blocks[0].content;
    expect(isNgsEditorTextContent(coloredContent)).toBe(true);
    if (isNgsEditorTextContent(coloredContent)) {
      expect(coloredContent[0].marks).toEqual([
        { type: 'backgroundColor', attrs: { color: 'rgb(254 249 195)' } },
        { type: 'textColor', attrs: { color: '#c026d3' } }
      ]);
    }

    expect(editor.execute(NGS_EDITOR_UNSET_TEXT_COLOR)).toBe(true);
    expect(editor.execute(NGS_EDITOR_UNSET_BACKGROUND_COLOR)).toBe(true);

    const plainContent = editor.document().blocks[0].content;
    expect(isNgsEditorTextContent(plainContent)).toBe(true);
    if (isNgsEditorTextContent(plainContent)) {
      expect(plainContent[0].marks).toEqual([]);
    }
  });

  it('rejects values that can escape an inline color declaration', () => {
    const editor = createEditor();

    expect(normalizeNgsEditorColor('var(--ngs-color-primary)')).toBe('var(--ngs-color-primary)');
    expect(normalizeNgsEditorColor('red; background-image: url(example)')).toBeNull();
    expect(editor.execute(NGS_EDITOR_SET_TEXT_COLOR, 'red; display: none')).toBe(false);
  });

  it('deletes an adjacent atomic block from a text-block boundary', () => {
    const editor = createEditor();
    const paragraph = createNgsEditorParagraph('Before media');
    editor.setDocument({
      version: 1,
      blocks: [
        paragraph,
        { id: createNgsEditorId('media'), type: 'media', content: null }
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
    const duplicateMarkPlugin = defineNgsEditorPlugin({
      id: 'duplicate-bold',
      marks: [{ type: 'bold', tagName: 'b' }]
    });

    expect(() => editor.setPlugins([
      basicTextEditorPlugin(),
      duplicateMarkPlugin
    ])).toThrowError('[NgsEditor] Duplicate mark id "bold".');
  });
});
