import { createNgsHeadlessEditorText } from './model';
import { NgsHeadlessEditorMarkDefinition } from './plugin';
import { NgsHeadlessEditorMarkRegistry, renderNgsHeadlessEditorRuns } from './render';

describe('Headless text rendering with server-compatible DOM methods', () => {
  let target: HTMLElement;
  const marks: NgsHeadlessEditorMarkDefinition[] = [
    { type: 'bold', tagName: 'strong' },
    { type: 'italic', tagName: 'em' }
  ];
  const registry: NgsHeadlessEditorMarkRegistry = {
    getMarkDefinition: type => marks.find(mark => mark.type === type),
    getMarkDefinitions: () => marks
  };

  beforeEach(() => {
    const serverDocument = document.implementation.createHTMLDocument();
    const createElement = serverDocument.createElement.bind(serverDocument);
    const createFragment = serverDocument.createDocumentFragment.bind(serverDocument);
    vi.spyOn(serverDocument, 'createElement').mockImplementation((tag: string) => {
      const element = createElement(tag);
      Object.defineProperties(element, {
        append: { value: undefined },
        replaceChildren: { value: undefined }
      });
      return element;
    });
    vi.spyOn(serverDocument, 'createDocumentFragment').mockImplementation(() => {
      const fragment = createFragment();
      Object.defineProperty(fragment, 'append', { value: undefined });
      return fragment;
    });
    target = serverDocument.createElement('div');
  });

  afterEach(() => vi.restoreAllMocks());

  it('renders text, nested marks and unknown marks without interpreting text as HTML', () => {
    renderNgsHeadlessEditorRuns(target, [
      createNgsHeadlessEditorText('<b>Hello</b>\n', [{ type: 'bold' }, { type: 'italic' }]),
      createNgsHeadlessEditorText('World', [{ type: 'custom' }])
    ], registry);

    expect(target.textContent).toBe('<b>Hello</b>\nWorld');
    expect(target.querySelector('em > strong')?.textContent).toBe('<b>Hello</b>\n');
    expect(target.querySelector('b')).toBeNull();
    expect(target.querySelector('span')?.getAttribute('data-ngs-headless-editor-mark')).toBe('custom');
  });

  it('replaces previous runs and renders an empty value as a single line break', () => {
    renderNgsHeadlessEditorRuns(target, [createNgsHeadlessEditorText('Before')], registry);
    renderNgsHeadlessEditorRuns(target, [createNgsHeadlessEditorText('After')], registry);
    expect(target.textContent).toBe('After');
    expect(target.childNodes.length).toBe(1);

    renderNgsHeadlessEditorRuns(target, [], registry);
    expect(target.innerHTML).toBe('<br>');
    renderNgsHeadlessEditorRuns(target, [createNgsHeadlessEditorText()], registry);
    expect(target.innerHTML).toBe('<br>');
  });
});
