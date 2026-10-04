import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createNgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorBlock, ContentEditorDocument } from '../types';
import { CONTENT_EDITOR_CONFIG, ContentEditorConfig, mergeContentEditorConfig, provideContentEditorConfig } from '../config';
import { ContentBuilderComponent } from '../content-builder/content-builder.component';
import { ContentEditorRenderer } from '../content-editor-renderer/content-editor-renderer';
import { CONTENT_EDITOR_DEFAULT_HTML_CONVERTERS } from './default-converters';
import { ContentEditorHtmlSerializer } from './html-serializer';
import { contentEditorBlockToHtml, contentEditorToHtml } from './to-html';

const text = (value: string) => [createNgsHeadlessEditorText(value)];
const paragraph = (id: string, value = id): ContentEditorBlock => ({ id, type: 'paragraph', content: text(value) });
const documentOf = (...blocks: ContentEditorBlock[]): ContentEditorDocument => ({ version: 1, blocks });
function parse(html: string): Document { return new DOMParser().parseFromString(html, 'text/html'); }

describe('Content Editor HTML export', () => {
  afterEach(() => { TestBed.resetTestingModule(); vi.restoreAllMocks(); });

  it('has a converter for every built-in block and exports semantic HTML with native metadata', () => {
    const blocks: ContentEditorBlock[] = [
      paragraph('paragraph'),
      { id: 'heading', type: 'heading', content: text('Title'), attrs: { settings: { level: 3 }, props: [{ name: 'text-alignment', value: 'right' }] } },
      { id: 'code', type: 'code', content: [createNgsHeadlessEditorText('<script>literal</script>\nNext', [{ type: 'bold' }])], attrs: { settings: { language: 'html' } } },
      { id: 'divider', type: 'divider', content: null },
      { id: 'bulletList', type: 'bulletList', content: [{ content: text('Parent'), children: [{ content: text('Child'), children: [] }] }] },
      { id: 'orderedList', type: 'orderedList', content: [{ content: text('Numbered'), children: [] }] },
      { id: 'quote', type: 'quote', content: { cite: { content: text('Quote') }, caption: { content: text('Author') } } },
      { id: 'table', type: 'table', content: null, attrs: { rows: [[text('Header')], [text('Cell')]], header: true, cellMetadata: [[{ options: { colspan: 2, rowspan: 3, width: 140 } }]] } },
      { id: 'image', type: 'image', content: { src: '/photo.png', alt: 'A photo' }, attrs: { settings: { width: 320 } } },
      { id: 'video', type: 'video', content: { src: '/movie.mp4', caption: 'Caption' } },
      { id: 'embed', type: 'embed', content: { url: 'https://example.com/embed', type: 'Example' } },
      { id: 'callout', type: 'callout', content: text('Warning'), attrs: { settings: { variant: 'warning' } } },
      { id: 'toggle', type: 'toggle', content: { title: text('Details'), blocks: [paragraph('nested')] }, attrs: { settings: { expanded: true } } },
      { id: 'attachment', type: 'attachment', content: { url: '/guide.pdf', name: 'guide.pdf' } },
      { id: 'gallery', type: 'gallery', content: { images: [{ src: '/slide.png', alt: 'Slide', caption: text('Slide caption') }] } },
      { id: 'grid', type: 'grid', content: { cells: [{ id: 'cell', blocks: [paragraph('cell-text')] }] }, attrs: { settings: { columns: 3, gap: 'large', stackOnMobile: true } } }
    ];
    expect(Object.keys(CONTENT_EDITOR_DEFAULT_HTML_CONVERTERS).sort()).toEqual(blocks.map(block => block.type).sort());
    const html = contentEditorToHtml(documentOf(...blocks));
    const doc = parse(html);
    expect(doc.querySelector('h3')?.style.textAlign).toBe('right');
    expect(doc.querySelector('pre code')?.textContent).toBe('<script>literal</script>\nNext');
    expect(doc.querySelector('pre strong, script')).toBeNull();
    expect(doc.querySelector('ul ul li')?.textContent).toBe('Child');
    expect(doc.querySelector('ol li')?.textContent).toBe('Numbered');
    expect(doc.querySelector('blockquote')?.textContent).toBe('Quote');
    expect(doc.querySelector('th')?.getAttribute('colspan')).toBe('2');
    expect(doc.querySelector('th')?.getAttribute('rowspan')).toBe('3');
    expect(doc.querySelector('th')?.getAttribute('width')).toBe('140');
    expect(doc.querySelector('td')?.textContent).toBe('Cell');
    expect(doc.querySelector('img')?.getAttribute('width')).toBe('320');
    expect(doc.querySelector('video')?.hasAttribute('controls')).toBe(true);
    expect(doc.querySelector('iframe')?.getAttribute('title')).toBe('Example');
    expect(doc.querySelector('aside')?.getAttribute('data-callout')).toBe('warning');
    expect(doc.querySelector('details')?.hasAttribute('open')).toBe(true);
    expect(doc.querySelector('details p')?.textContent).toBe('nested');
    expect(doc.querySelector('[download]')?.getAttribute('href')).toBe('/guide.pdf');
    expect(doc.querySelector('[data-content-editor="gallery"] figcaption')?.textContent).toBe('Slide caption');
    expect(doc.querySelector('.ngs-content-editor-html-grid')?.getAttribute('style')).toContain('--ngs-html-grid-columns:3');
    expect(doc.querySelector('.ngs-content-editor-html-grid-cell p')?.textContent).toBe('cell-text');
    expect(html).not.toContain('contenteditable');
  });

  it('preserves marks and line breaks, escaping text and filtering executable links and CSS', () => {
    const block = paragraph('p');
    const html = contentEditorBlockToHtml({ ...block, content: [
      createNgsHeadlessEditorText('<b>Text & "quotes"</b>\nNext', [{ type: 'bold' }, { type: 'italic' }, { type: 'underline' }, { type: 'strike' }, { type: 'superscript' }, { type: 'subscript' }, { type: 'code' }]),
      createNgsHeadlessEditorText('Link', [{ type: 'link', attrs: { href: 'https://example.com/?a=1&b=2', target: '_blank' } }]),
      createNgsHeadlessEditorText('Color', [{ type: 'textColor', attrs: { color: '#ff0000' } }, { type: 'backgroundColor', attrs: { color: 'rgb(1, 2, 3)' } }]),
      createNgsHeadlessEditorText('Unsafe', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }, { type: 'textColor', attrs: { color: 'red;position:fixed' } }])
    ] });
    const doc = parse(html);
    expect(doc.querySelector('strong')?.textContent).toBe('<b>Text & "quotes"</b>Next');
    expect(doc.querySelectorAll('br')).toHaveLength(1);
    expect(doc.querySelectorAll('a')).toHaveLength(1);
    expect(doc.querySelector('a')?.getAttribute('href')).toBe('https://example.com/?a=1&b=2');
    expect(doc.querySelector('a')?.rel).toBe('noopener noreferrer');
    expect(doc.querySelector<HTMLSpanElement>('span[style^="color:"]')?.style.color).toBe('rgb(255, 0, 0)');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('position:fixed');
  });

  it('escapes media attributes, supports default data uploads and omits invalid sources', () => {
    const html = contentEditorToHtml(documentOf(
      { id: 'image', type: 'image', content: { src: '/safe.png', alt: '\"><img src=x onerror=alert(1)>' } },
      { id: 'bad-image', type: 'image', content: { src: 'javascript:alert(1)', alt: '' } },
      { id: 'bad-embed', type: 'embed', content: { url: 'data:text/html;base64,PHNjcmlwdD4=', type: '' } },
      { id: 'file', type: 'attachment', content: { url: 'data:text/plain;base64,SGVsbG8=', name: 'readme.txt' } }
    ));
    const doc = parse(html);
    expect(doc.querySelectorAll('img')).toHaveLength(1);
    expect(doc.querySelector('[onerror], iframe')).toBeNull();
    expect(doc.querySelector('img')?.alt).toBe('\"><img src=x onerror=alert(1)>');
    expect(doc.querySelector('[download]')?.getAttribute('href')).toBe('data:text/plain;base64,SGVsbG8=');
  });

  it('applies overrides recursively and lets an override call the default without recursing', () => {
    const nested = { id: 'toggle', type: 'toggle', content: { title: text('Details'), blocks: [paragraph('nested')] } };
    const grid: ContentEditorBlock = { id: 'grid', type: 'grid', content: { cells: [{ id: 'cell', blocks: [nested] }] } };
    const config: ContentEditorConfig = { blocks: {
      paragraph: { toHtml: (block, ctx) => `<article>${ctx.renderText(block.content)}</article>` },
      toggle: { toHtml: (block, ctx) => `<section>${ctx.defaultToHtml(block)}</section>` }
    }, marks: { bold: (html) => `<b>${html}</b>` } };
    const doc = parse(contentEditorBlockToHtml(grid, config));
    expect(doc.querySelector('.ngs-content-editor-html-grid-cell section details article')?.textContent).toBe('nested');
    expect(contentEditorBlockToHtml({ ...paragraph('p'), content: [createNgsHeadlessEditorText('B', [{ type: 'bold' }])] }, config)).toBe('<article><b>B</b></article>');
  });

  it('includes responsive grid CSS once across nested grids and can omit it explicitly', () => {
    const child: ContentEditorBlock = { id: 'child', type: 'grid', content: { cells: [] }, attrs: { settings: { stackOnMobile: false } } };
    const grid: ContentEditorBlock = { id: 'grid', type: 'grid', content: { cells: [{ id: 'cell', blocks: [child] }] } };
    const html = contentEditorToHtml(documentOf(grid, child));
    expect(html.match(/<style>/g)).toHaveLength(1);
    expect(html).toContain('@container(max-width:480px)');
    expect(contentEditorBlockToHtml(child)).not.toContain('class="ngs-content-editor-html-grid-cells ngs-content-editor-html-grid-stack"');
    expect(contentEditorBlockToHtml(grid, { includeStyles: false })).not.toContain('<style>');
  });

  it('renders exported grid layout responsively without Angular components or theme styles', () => {
    const grid: ContentEditorBlock = { id: 'grid', type: 'grid', content: { cells: [
      { id: 'a', blocks: [paragraph('A')] }, { id: 'b', blocks: [paragraph('B')] }, { id: 'c', blocks: [paragraph('C')] }
    ] }, attrs: { settings: { columns: 3, gap: 'large', stackOnMobile: true } } };
    const host = document.createElement('div');
    host.style.width = '600px'; host.innerHTML = contentEditorBlockToHtml(grid);
    document.body.appendChild(host);
    try {
      const cells = host.querySelector('.ngs-content-editor-html-grid-cells')!;
      expect(getComputedStyle(cells).gridTemplateColumns.split(' ')).toHaveLength(3);
      expect(getComputedStyle(cells).gap).toBe('36px');
      host.style.width = '320px';
      expect(getComputedStyle(cells).gridTemplateColumns.split(' ')).toHaveLength(1);
    } finally { host.remove(); }
  });

  it('supports custom blocks and explicit unknown-block handling without silently dropping content', () => {
    const block = { id: 'custom', type: 'custom', content: { title: '<Custom>' } };
    expect(() => contentEditorBlockToHtml(block)).toThrow('No HTML converter');
    expect(() => contentEditorBlockToHtml({ ...block, type: 'constructor' })).toThrow('No HTML converter');
    expect(contentEditorBlockToHtml(block, { blocks: { custom: { toHtml: (value, ctx) => `<section>${ctx.escape(value.content.title)}</section>` } } })).toBe('<section>&lt;Custom&gt;</section>');
    expect(contentEditorBlockToHtml(block, { unknownBlockToHtml: () => '' })).toBe('');
  });

  it('exports without accessing DOM APIs or mutating the saved document', () => {
    const doc = Object.freeze(documentOf(Object.freeze(paragraph('p', '<Hello>'))));
    const spy = vi.spyOn(document, 'createElement').mockImplementation(() => { throw new Error('DOM unavailable'); });
    expect(contentEditorToHtml(doc)).toBe('<p>&lt;Hello&gt;</p>');
    expect(spy).not.toHaveBeenCalled();
    expect(doc.blocks[0].content).toEqual(text('<Hello>'));
  });

  it('merges per-block config fields without mutating providers or dropping upload options', () => {
    const uploadFn = () => Promise.resolve('/image.png');
    const global: ContentEditorConfig = { blocks: { image: { toHtml: () => 'global', options: { uploadFn, limit: 1 } } } };
    const local: ContentEditorConfig = { blocks: { image: { options: { limit: 2 } } } };
    const merged = mergeContentEditorConfig(global, local);
    expect(merged.blocks?.['image'].toHtml).toBe(global.blocks?.['image'].toHtml);
    expect(merged.blocks?.['image'].options).toEqual({ uploadFn, limit: 2 });
    expect(global.blocks?.['image'].options?.['limit']).toBe(1);
  });

  it('inherits global configuration in child environments and scopes the serializer correctly', () => {
    TestBed.configureTestingModule({ providers: [provideContentEditorConfig({ blocks: {
      paragraph: { toHtml: () => '<p>Global</p>' }, heading: { toHtml: () => '<h2>Global heading</h2>' }
    } })] });
    const root = TestBed.inject(ContentEditorHtmlSerializer);
    const child = createEnvironmentInjector([provideContentEditorConfig({ blocks: { paragraph: { toHtml: () => '<p>Child</p>' } } })], TestBed.inject(EnvironmentInjector));
    try {
      expect(root.toHtml(documentOf(paragraph('p')))).toBe('<p>Global</p>');
      expect(child.get(ContentEditorHtmlSerializer).toHtml(documentOf(paragraph('p'), { id: 'h', type: 'heading', content: text('H') }))).toBe('<p>Child</p><h2>Global heading</h2>');
      expect(child.get(CONTENT_EDITOR_CONFIG).blocks?.['heading'].toHtml).toBeTruthy();
      expect(root.toHtml(documentOf(paragraph('p')))).toBe('<p>Global</p>');
    } finally { child.destroy(); }
  });

  it('uses instance and call overrides in the builder, including runtime changes to config and options', async () => {
    const globalUpload = () => Promise.resolve('/global.png');
    TestBed.configureTestingModule({ imports: [ContentBuilderComponent], providers: [provideContentEditorConfig({ blocks: {
      paragraph: { toHtml: () => '<p>Global</p>' }, image: { options: { uploadFn: globalUpload } }
    } })] });
    const fixture = TestBed.createComponent(ContentBuilderComponent);
    fixture.componentRef.setInput('persistDraft', false);
    fixture.componentRef.setInput('content', documentOf(paragraph('p', '')));
    fixture.componentRef.setInput('config', { blocks: { paragraph: { toHtml: () => '<p>Instance</p>' } } });
    fixture.autoDetectChanges(); await fixture.whenStable();
    const builder = fixture.componentInstance;
    expect(builder.toHtml()).toBe('<p>Instance</p>');
    expect(builder.toHtml({ blocks: { paragraph: { toHtml: () => '<p>Call</p>' } } })).toBe('<p>Call</p>');
    expect(builder.getBlockDefOption('image', 'uploadFn')).toBe(globalUpload);
    expect(builder.getBlockDefOption('paragraph', 'toHtml')).toBeTruthy();
    const localUpload = () => Promise.resolve('/local.png');
    fixture.componentRef.setInput('options', { image: { uploadFn: localUpload } });
    fixture.componentRef.setInput('config', { blocks: { paragraph: { toHtml: () => '<p>Changed</p>' } } });
    await fixture.whenStable();
    expect(builder.toHtml()).toBe('<p>Changed</p>');
    expect(builder.blockToHtml(paragraph('p'))).toBe('<p>Changed</p>');
    expect(builder.getBlockDefOption('image', 'uploadFn')).toBe(localUpload);
    expect(builder.editor.canUndo()).toBe(false);
  });

  it('uses renderer block input precedence and global/instance configuration during export', async () => {
    TestBed.configureTestingModule({ imports: [ContentEditorRenderer], providers: [provideContentEditorConfig({ blocks: { paragraph: { toHtml: () => '<p>Global</p>' } } })] });
    const fixture = TestBed.createComponent(ContentEditorRenderer);
    fixture.componentRef.setInput('content', documentOf(paragraph('ignored')));
    fixture.componentRef.setInput('blocks', [paragraph('chosen')]);
    fixture.autoDetectChanges(); await fixture.whenStable();
    expect(fixture.componentInstance.toHtml()).toBe('<p>Global</p>');
    fixture.componentRef.setInput('config', { blocks: { paragraph: { toHtml: (block: any, ctx: any) => `<article>${ctx.renderText(block.content)}</article>` } } });
    expect(fixture.componentInstance.toHtml()).toBe('<article>chosen</article>');
    expect(fixture.componentInstance.toHtml({ blocks: { paragraph: { toHtml: () => 'Call' } } })).toBe('Call');
  });
});
