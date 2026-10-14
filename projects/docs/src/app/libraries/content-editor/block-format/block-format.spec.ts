import { contentEditorFromJson, contentEditorFromHtml, contentEditorToHtml, CONTENT_EDITOR_DEFAULT_HTML_CONVERTERS } from '@ngstarter-ui/components/content-editor';
import { blockFormatExample } from './block-examples';

describe('Content Editor documented block format', () => {
  it('provides a valid native example for every built-in block, including nested structures', () => {
    expect(contentEditorFromJson(blockFormatExample)).toEqual(blockFormatExample);
    expect(blockFormatExample.blocks.map(block => block.type).sort()).toEqual(Object.keys(CONTENT_EDITOR_DEFAULT_HTML_CONVERTERS).sort());
  });
  it('keeps every documented block type when importing the default HTML export', () => {
    expect(contentEditorFromHtml(contentEditorToHtml(blockFormatExample)).blocks.map(block => block.type)).toEqual(blockFormatExample.blocks.map(block => block.type));
  });
});
