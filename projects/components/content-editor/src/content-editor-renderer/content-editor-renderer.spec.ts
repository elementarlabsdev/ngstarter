import { TestBed } from '@angular/core/testing';
import { createNgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorRenderer } from './content-editor-renderer';

describe('ContentEditorRenderer native document', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('renders marked text, nested lists, quote captions, literal code and rich table metadata', async () => {
    TestBed.configureTestingModule({ imports: [ContentEditorRenderer] });
    const fixture = TestBed.createComponent(ContentEditorRenderer);
    const rich = [createNgsHeadlessEditorText('Marked', [
      { type: 'bold' }, { type: 'textColor', attrs: { color: '#ff0000' } },
      { type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }
    ])];
    fixture.componentRef.setInput('content', { version: 1, blocks: [
      { id: 'p', type: 'paragraph', content: rich },
      { id: 'list', type: 'orderedList', content: [{ content: rich, children: [{ content: [createNgsHeadlessEditorText('Child')], children: [] }] }], attrs: { settings: { listStyle: 'ordered' } } },
      { id: 'quote', type: 'quote', content: { cite: { content: rich }, caption: { content: [createNgsHeadlessEditorText('Author')] } } },
      { id: 'table', type: 'table', content: null, attrs: { rows: [[rich]], header: false, cellMetadata: [[{ options: { colspan: 2, rowspan: 3, width: 120 } }]] } },
      { id: 'code', type: 'code', content: [createNgsHeadlessEditorText('<b>literal</b>')] }
    ] });
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('strong')?.textContent).toBe('Marked');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(element.querySelectorAll('ol')).toHaveLength(2);
    expect(element.querySelector('figcaption')?.textContent).toBe('Author');
    expect(element.querySelector('td')?.getAttribute('colspan')).toBe('2');
    expect(element.querySelector('td')?.getAttribute('rowspan')).toBe('3');
    expect(element.querySelector('td strong')?.textContent).toBe('Marked');
    await expect.poll(() => element.querySelector('ngs-content-editor-code-renderer')?.textContent).toContain('<b>literal</b>');
  });
  it('renders callouts, nested toggles, attachments, image carousels and grid cells', async () => {
    TestBed.configureTestingModule({ imports: [ContentEditorRenderer] });
    const fixture = TestBed.createComponent(ContentEditorRenderer);
    const rich = [createNgsHeadlessEditorText('Rich', [{ type: 'bold' }])];
    fixture.componentRef.setInput('content', { version: 1, blocks: [
      { id: 'note', type: 'callout', content: rich, attrs: { settings: { variant: 'warning' } } },
      { id: 'toggle', type: 'toggle', content: { title: rich, blocks: [{ id: 'nested', type: 'paragraph', content: rich }] }, attrs: { settings: { expanded: true } } },
      { id: 'file', type: 'attachment', content: { url: '/guide.pdf', name: 'guide.pdf', size: 2048, mimeType: 'application/pdf' } },
      { id: 'gallery', type: 'gallery', content: { images: [
        { id: 'image', src: '/photo.png', alt: 'Photo', caption: rich },
        { id: 'slide', src: '/slide.png', alt: 'Slide', caption: [] }
      ] } },
      { id: 'grid', type: 'grid', content: { cells: [{ id: 'left', blocks: [{ id: 'column-text', type: 'paragraph', content: rich }] }, { id: 'right', blocks: [] }] } }
    ] });
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('ngs-alert')?.getAttribute('ngs-alert-variant')).toBe('notice');
    expect(element.querySelector('ngs-content-editor-toggle-renderer [data-block-id="nested"] strong')?.textContent).toBe('Rich');
    expect(element.querySelector('a[download]')?.getAttribute('href')).toBe('/guide.pdf');
    expect(element.querySelector('a[download]')?.getAttribute('download')).toBe('guide.pdf');
    expect(element.querySelector('ngs-content-editor-gallery-renderer figcaption strong')?.textContent).toBe('Rich');
    expect(element.querySelector('img')?.getAttribute('alt')).toBe('Photo');
    expect(element.querySelectorAll('ngs-carousel-card')).toHaveLength(2);
    expect(element.querySelector('button[aria-label="Previous image"]')).toBeTruthy();
    expect(element.querySelector('button[aria-label="Next image"]')).toBeTruthy();
    expect(element.querySelector('ngs-content-editor-grid-renderer [data-block-id="column-text"] strong')?.textContent).toBe('Rich');
  });

  it('applies grid spacing and reflows all cells on small containers, with an optional fixed column count', async () => {
    TestBed.configureTestingModule({ imports: [ContentEditorRenderer] });
    const fixture = TestBed.createComponent(ContentEditorRenderer);
    fixture.nativeElement.style.width = '600px';
    fixture.nativeElement.style.setProperty('--spacing', '0.25rem');
    const grid = {
      id: 'grid', type: 'grid', content: { cells: Array.from({ length: 5 }, (_, index) => ({
        id: `cell-${index}`, blocks: [{ id: `text-${index}`, type: 'paragraph', content: [createNgsHeadlessEditorText(`Cell ${index}`)] }]
      })) }, attrs: { settings: { columns: 3, gap: 'large', stackOnMobile: true } }
    };
    fixture.componentRef.setInput('content', { version: 1, blocks: [grid] });
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const layout = fixture.nativeElement.querySelector('ngs-content-editor-grid-renderer .grid-cells') as HTMLElement;
    await expect.poll(() => getComputedStyle(layout).gridTemplateColumns.split(' ').length).toBe(3);
    expect(getComputedStyle(layout).gap).toBe('36px');
    expect(layout.querySelectorAll('ngs-content-editor-renderer')).toHaveLength(5);
    fixture.nativeElement.style.width = '320px';
    await expect.poll(() => getComputedStyle(layout).gridTemplateColumns.split(' ').length).toBe(1);
    fixture.componentRef.setInput('content', { version: 1, blocks: [{
      ...grid, attrs: { settings: { columns: 3, gap: 'small', stackOnMobile: false } }
    }] });
    await fixture.whenStable();
    await expect.poll(() => getComputedStyle(layout).gridTemplateColumns.split(' ').length).toBe(3);
    expect(getComputedStyle(layout).gap).toBe('12px');
  });

});
