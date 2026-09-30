import {
  getNgsHeadlessEditorDocumentText,
  isNgsHeadlessEditorTextContent,
  NgsHeadlessEditorDocument,
  NgsHeadlessEditorMark
} from '@ngstarter-ui/components/headless-editor';

const MARK_TAGS: Record<string, string> = {
  bold: 'strong',
  italic: 'em',
  strike: 's',
  code: 'code'
};

const BLOCK_TAGS: Record<string, string> = {
  paragraph: 'p'
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function wrap(text: string, marks: readonly NgsHeadlessEditorMark[]): string {
  // Unknown marks are dropped instead of being written as raw attributes.
  return marks.reduce((html, mark) => {
    const tag = MARK_TAGS[mark.type];
    return tag ? `<${tag}>${html}</${tag}>` : html;
  }, escapeHtml(text));
}

/**
 * Converts the JSON document into HTML for e-mails, previews or search indexes.
 * The JSON stays the source of truth; HTML is a derived, escaped output.
 */
export function toHtml(document: NgsHeadlessEditorDocument): string {
  return document.blocks
    .map(block => {
      const tag = BLOCK_TAGS[block.type] ?? 'div';
      const inner = isNgsHeadlessEditorTextContent(block.content)
        ? block.content.map(run => wrap(run.text, run.marks)).join('')
        : '';
      return `<${tag}>${inner}</${tag}>`;
    })
    .join('\n');
}

export function toPlainText(document: NgsHeadlessEditorDocument): string {
  return getNgsHeadlessEditorDocumentText(document);
}
