import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createNgsHeadlessEditorText, getNgsHeadlessEditorTableData } from '@ngstarter-ui/components/headless-editor';
import { ContentBuilderComponent } from '../content-builder/content-builder.component';
import { ContentEditorBlock, ContentEditorDocument } from '../types';
import { provideContentEditorConfig } from '../config';
import { contentEditorToHtml } from '../html/to-html';
import { contentEditorFromJson } from './from-json';
import { contentEditorFromHtml } from './from-html';
import { ContentEditorImporter } from './content-importer';
import { ContentEditorImportError } from './types';

const text = (value: string) => [createNgsHeadlessEditorText(value)];
const paragraph = (id = 'paragraph'): ContentEditorBlock => ({ id, type: 'paragraph', content: text('Content') });
const doc = (...blocks: ContentEditorBlock[]): ContentEditorDocument => ({ version: 1, blocks });
const allBlocks = (): ContentEditorBlock[] => [
  paragraph(),
  { id: 'heading', type: 'heading', content: text('Heading'), attrs: { settings: { level: 3 } } },
  { id: 'code', type: 'code', content: text('let x = 1;\n<x>'), attrs: { settings: { language: 'javascript' } } },
  { id: 'divider', type: 'divider', content: null },
  { id: 'bullet', type: 'bulletList', content: [{ content: text('Parent'), children: [{ content: text('Child'), children: [] }] }] },
  { id: 'ordered', type: 'orderedList', content: [{ content: text('First'), children: [] }] },
  { id: 'quote', type: 'quote', content: { cite: { content: text('Quote') }, caption: { content: text('Author') } } },
  { id: 'table', type: 'table', content: null, attrs: { rows: [[text('Cell')]], header: true, cellMetadata: [[{ options: { colspan: 2, rowspan: 3, width: 120 }, props: [{ name: 'text-alignment', value: 'right' }] }]] } },
  { id: 'image', type: 'image', content: { src: '/photo.png', alt: 'Photo' }, attrs: { settings: { width: 200 } } },
  { id: 'video', type: 'video', content: { src: '/movie.mp4', caption: 'Demo', orientation: 'landscape' } },
  { id: 'embed', type: 'embed', content: { url: 'https://example.com/embed', type: 'Example' } },
  { id: 'callout', type: 'callout', content: text('Warning'), attrs: { settings: { variant: 'warning' } } },
  { id: 'toggle', type: 'toggle', content: { title: text('Details'), blocks: [paragraph('nested')] }, attrs: { settings: { expanded: true } } },
  { id: 'attachment', type: 'attachment', content: { url: '/file.pdf', name: 'file.pdf', size: 42, mimeType: 'application/pdf' } },
  { id: 'gallery', type: 'gallery', content: { images: [{ id: 'photo', src: '/photo.png', alt: 'Photo', caption: text('Caption') }] } },
  { id: 'grid', type: 'grid', content: { cells: [{ id: 'cell', blocks: [paragraph('grid-text')] }] }, attrs: { settings: { columns: 3, gap: 'large', stackOnMobile: true } } }
];

describe('Content Editor import', () => {
  afterEach(() => { TestBed.resetTestingModule(); vi.restoreAllMocks(); });

  it('imports all native blocks losslessly from objects and JSON, preserving metadata and detaching caller objects', () => {
    const original = doc(...allBlocks());
    const imported = contentEditorFromJson(original);
    expect(imported).toEqual(original);
    expect(contentEditorFromJson(JSON.stringify(original))).toEqual(original);
    expect(imported.blocks[12].content).not.toBe(original.blocks[12].content);
    expect(contentEditorFromJson(doc())).toEqual(doc());
    expect(contentEditorFromJson(doc({ ...paragraph(), attrs: { application: { value: 3 }, settings: undefined } })).blocks[0].attrs).toEqual({ application: { value: 3 } });
  });

  it.each([
    ['bad JSON', '{', '$'],
    ['version', { version: 2, blocks: [] }, '$.version'],
    ['missing marks', doc({ ...paragraph(), content: [{ type: 'text', text: 'Bad' }] }), '$.blocks[0].content[0].marks'],
    ['native table', doc({ id: 'table', type: 'table', content: [], attrs: { rows: [] } }), '$.blocks[0].content'],
    ['nested ID', doc(paragraph(), { id: 'toggle', type: 'toggle', content: { title: [], blocks: [paragraph()] } }), '$.blocks[1].content.blocks[0].id'],
    ['invalid grid columns', doc({ id: 'grid', type: 'grid', content: { cells: [] }, attrs: { settings: { columns: 7 } } }), '$.blocks[0].attrs.settings.columns'],
    ['unsupported resource', doc({ id: 'image', type: 'image', content: { src: 'javascript:alert(1)', alt: 'Bad' } }), '$.blocks[0].content.src'],
    ['unsupported link', doc({ ...paragraph(), content: [createNgsHeadlessEditorText('Bad', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }])] }), '$.blocks[0].content[0].marks[0].attrs.href'],
    ['unsupported link target', doc({ ...paragraph(), content: [createNgsHeadlessEditorText('Bad', [{ type: 'link', attrs: { href: 'https://example.com', target: 'named-frame' } }])] }), '$.blocks[0].content[0].marks[0].attrs.target'],
    ['missing gallery caption', doc({ id: 'g', type: 'gallery', content: { images: [{ id: 'i', src: '/i', alt: '' }] } }), '$.blocks[0].content.images[0].caption'],
    ['unknown type', doc({ id: 'custom', type: 'custom', content: {} }), '$.blocks[0].type']
  ])('rejects %s with an actionable path', (_name, source, path) => {
    try { contentEditorFromJson(source); throw new Error('Expected import to fail'); }
    catch (error) { expect(error).toBeInstanceOf(ContentEditorImportError); expect((error as ContentEditorImportError).path).toBe(path); }
  });

  it('rejects cycles, non-JSON values, invalid limits and excessive nesting/block counts', () => {
    const cyclic: any = {}; cyclic.self = cyclic;
    expect(() => contentEditorFromJson(doc({ ...paragraph(), attrs: cyclic }))).toThrow('Cyclic data');
    expect(() => contentEditorFromJson(doc({ ...paragraph(), attrs: { callback: () => undefined } }))).toThrow('JSON-compatible');
    expect(() => contentEditorFromJson(doc(), {}, { maxDepth: 0 })).toThrow('positive integers');
    expect(() => contentEditorFromJson(doc(paragraph('one'), paragraph('two')), {}, { maxBlocks: 1 })).toThrow('Maximum block count');
    expect(() => contentEditorFromJson(doc(paragraph()), {}, { maxDepth: 2 })).toThrow('Maximum nesting depth');
    expect(contentEditorFromJson(doc({ id: 'custom', type: 'custom', content: {} }), {}, { allowUnknownBlocks: true }).blocks[0].type).toBe('custom');
  });

  it('recognizes every built-in HTML export, including nested layout, table metadata and literal code', () => {
    const imported = contentEditorFromHtml(contentEditorToHtml(doc(...allBlocks())));
    expect(imported.blocks.map(block => block.type)).toEqual(allBlocks().map(block => block.type));
    expect((imported.blocks[2].content as any)[0].text).toBe('let x = 1;\n<x>');
    expect(imported.blocks[7].attrs?.['cellMetadata']).toEqual([[{ props: [{ name: 'text-alignment', value: 'right' }], options: { colspan: 2, rowspan: 3, width: 120 } }]]);
    expect(getNgsHeadlessEditorTableData(imported.blocks[7]).header).toBe(true);
    expect((imported.blocks[12].content as any).blocks[0].type).toBe('paragraph');
    expect(imported.blocks[15].attrs?.['settings']).toEqual({ columns: 3, gap: 'large', stackOnMobile: true });
    expect((imported.blocks[15].content as any).cells[0].blocks[0].type).toBe('paragraph');
  });

  it('imports root and inline formatting, colors, links, line breaks and supported descendant blocks', () => {
    const imported = contentEditorFromHtml('<div><span><h3>Title</h3><p style="color:rgb(255,0,0)"><b>Bold</b> <span style="color:blue;background-color:yellow">Colors</span><br><a href="https://example.com" target="_blank">Link</a></p></span></div>');
    expect(imported.blocks.map(b => b.type)).toEqual(['heading', 'paragraph']);
    expect(imported.blocks[0].attrs?.['settings']).toEqual({ level: 3 });
    const runs: any = imported.blocks[1].content;
    expect(runs.find((run: any) => run.text === 'Bold').marks.map((mark: any) => mark.type)).toEqual(['bold', 'textColor']);
    expect(runs.find((run: any) => run.text === 'Colors').marks.map((mark: any) => mark.type)).toEqual(['backgroundColor', 'textColor']);
    expect(runs.map((run: any) => run.text).join('')).toBe('Bold Colors\nLink');
    expect(runs.at(-1).marks.find((mark: any) => mark.type === 'link').attrs).toEqual({ href: 'https://example.com', target: '_blank' });
  });

  it('does not import executable markup, unsafe URLs, event handlers or arbitrary layout CSS', () => {
    const imported = contentEditorFromHtml('<script>alert(1)</script><style>p{color:red}</style><p onclick="evil()"><a href="javascript:alert(1)">Keep text</a></p><iframe src="javascript:evil()"></iframe><img src="javascript:evil()"><object>Drop</object>');
    expect(imported.blocks).toHaveLength(1);
    expect(imported.blocks[0].content).toEqual(text('Keep text'));
    expect(JSON.stringify(imported)).not.toMatch(/onclick|alert|javascript|Drop/);
    expect(() => contentEditorFromHtml('<div>'.repeat(80) + 'Text' + '</div>'.repeat(80))).toThrow('Maximum nesting depth');
    expect(() => contentEditorFromHtml('<p>A</p><p>B</p>', {}, { maxBlocks: 1 })).toThrow('Maximum block count');
  });

  it('supports per-block overrides/default parsing and mark definitions inside nested blocks', () => {
    const config = {
      blocks: {
        heading: { fromHtml: { selector: 'h2', parse: (el: Element, ctx: any) => ctx.defaultFromHtml(el).map((block: any) => ({ ...block, attrs: { settings: { level: 4 } } })) } },
        product: { fromHtml: { selector: '[data-product]', parse: (el: Element, ctx: any) => ctx.createBlock('product', { sku: el.getAttribute('data-product') }) }, validateImport: (block: any) => block.content.sku ? undefined : 'Missing sku' }
      },
      importMarks: [{ type: 'mention', tagName: 'span', parseTags: ['span'], readAttributes: (el: HTMLElement) => el.hasAttribute('data-mention') ? { id: el.getAttribute('data-mention')! } : undefined }]
    };
    const imported = contentEditorFromHtml('<details><summary>Details</summary><h2>Title</h2><div data-product="sku-1"></div><p><span data-mention="user">Name</span></p></details>', config);
    const blocks: any = (imported.blocks[0].content as any).blocks;
    expect(blocks[0].attrs.settings.level).toBe(4);
    expect(blocks[1].type).toBe('product');
    expect(blocks[2].content[0].marks).toEqual([{ type: 'mention', attrs: { id: 'user' } }]);
    expect(() => contentEditorFromHtml('<div data-product=""></div>', config)).toThrow('Missing sku');
  });

  it('inherits route import configuration without changing parent configuration', () => {
    TestBed.configureTestingModule({ providers: [provideContentEditorConfig({ blocks: { paragraph: { validateImport: () => 'Parent validation' } } })] });
    const child = createEnvironmentInjector([provideContentEditorConfig({ blocks: { paragraph: { validateImport: () => undefined } } })], TestBed.inject(EnvironmentInjector));
    try {
      expect(() => TestBed.inject(ContentEditorImporter).fromJson(doc(paragraph()))).toThrow('Parent validation');
      expect(child.get(ContentEditorImporter).fromHtml('<p>Route</p>').blocks[0].content).toEqual(text('Route'));
    } finally { child.destroy(); }
  });

  it('replaces the builder atomically, emits content and preserves undo/redo on success and failure', async () => {
    TestBed.configureTestingModule({ imports: [ContentBuilderComponent] });
    const fixture = TestBed.createComponent(ContentBuilderComponent);
    fixture.componentRef.setInput('persistDraft', false);
    fixture.componentRef.setInput('content', doc(paragraph('old')));
    fixture.autoDetectChanges(); await fixture.whenStable();
    const builder = fixture.componentInstance;
    builder.selectBlock('old');
    const previous = builder.getData();
    const changes = vi.fn(); builder.contentChanged.subscribe(changes);
    expect(() => builder.importJson('{')).toThrow('Invalid JSON');
    expect(builder.getData()).toBe(previous);
    expect(builder.selectedBlocksModel.selected).toEqual(['old']);
    builder.importHtml('<h2>Imported</h2><p>Body</p>');
    await fixture.whenStable();
    const imported = builder.getData();
    expect(imported.blocks.map(block => block.type)).toEqual(['heading', 'paragraph']);
    expect(builder.selectedBlocksModel.selected).toEqual([]);
    expect(changes).toHaveBeenCalled();
    builder.editor.setReadOnly(true);
    expect(() => builder.importJson(doc(paragraph('blocked')))).toThrow('read-only editor');
    expect(builder.getData()).toBe(imported);
    builder.editor.setReadOnly(false);
    builder.editor.undo(); await fixture.whenStable(); expect(builder.getData()).toEqual(previous);
    builder.editor.redo(); await fixture.whenStable(); expect(builder.getData()).toEqual(imported);
  });
});
