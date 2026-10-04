import { TestBed } from '@angular/core/testing';
import { NgsHeadlessEditor, provideNgsHeadlessEditor } from './headless-editor';
import { basicTextEditorPlugin } from './basic-text.plugin';
import { withHeadlessEditorPlugin } from './plugin';
import { createNgsHeadlessEditorDocument, createNgsHeadlessEditorText } from './model';
import { linkEditorPlugin, normalizeNgsHeadlessEditorLink, NGS_HEADLESS_EDITOR_SET_LINK, NGS_HEADLESS_EDITOR_UNSET_LINK } from './link.plugin';
import { readNgsHeadlessEditorInlineContent, renderNgsHeadlessEditorRuns } from './render';

describe('Shared headless link plugin', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('applies and removes a link through normal commands and document history', () => {
    TestBed.configureTestingModule({ providers: [provideNgsHeadlessEditor(withHeadlessEditorPlugin(basicTextEditorPlugin()), withHeadlessEditorPlugin(linkEditorPlugin()))] });
    const editor = TestBed.inject(NgsHeadlessEditor);
    editor.setDocument(createNgsHeadlessEditorDocument('Link'));
    const id = editor.document().blocks[0].id;
    editor.setSelection({ anchor: { blockId: id, offset: 0 }, focus: { blockId: id, offset: 4 } });
    expect(editor.execute(NGS_HEADLESS_EDITOR_SET_LINK, { href: 'example.com', target: '_blank' })).toBe(true);
    const element = document.createElement('div');
    renderNgsHeadlessEditorRuns(element, editor.document().blocks[0].content as any, editor);
    expect(element.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(readNgsHeadlessEditorInlineContent(element, editor)).toEqual([
      createNgsHeadlessEditorText('Link', [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }])
    ]);
    editor.execute(NGS_HEADLESS_EDITOR_UNSET_LINK);
    editor.undo();
    expect(editor.isMarkActive('link')).toBe(true);
  });
  it('validates URLs before storing or rendering them', () => {
    for (const href of ['javascript:alert(1)', 'java\nscript:alert(1)', 'data:text/html,test', 'vbscript:msgbox(1)', '']) {
      expect(normalizeNgsHeadlessEditorLink(href)).toBeNull();
    }
    for (const href of ['/relative', '#section', 'mailto:a@example.com', 'tel:+123', 'https://example.com']) {
      expect(normalizeNgsHeadlessEditorLink(href)).toBe(href);
    }
  });
});
