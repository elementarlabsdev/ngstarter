import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ContentBuilderComponent } from './content-builder/content-builder.component';
import { ContentEditorRenderer } from './content-editor-renderer/content-editor-renderer';
import { ContentEditorBlockBase } from './_builder/block-base';
import { ContentEditorRendererBase } from './_renderer/renderer-base';
import { ContentEditorConfig, provideContentEditorConfig } from './config';
import { contentEditorFromHtml } from './import/from-html';
import { contentEditorFromJson } from './import/from-json';
import { contentEditorToHtml } from './html/to-html';

@Component({ selector: 'test-custom-editor', template: '{{content().label}}', changeDetection: ChangeDetectionStrategy.OnPush })
class CustomEditor extends ContentEditorBlockBase<{ label: string }> {}
@Component({ selector: 'test-custom-preview', template: 'Preview: {{content()?.label}}', changeDetection: ChangeDetectionStrategy.OnPush })
class CustomPreview extends ContentEditorRendererBase<{ label: string }> {}
const config: ContentEditorConfig = { blocks: { product: {
  editor: CustomEditor, renderer: CustomPreview, create: () => ({ content: { label: 'New product' }, attrs: { source: 'custom' } }),
  menu: { title: 'Product', description: 'A product card' },
  validateImport: block => typeof (block.content as any)?.label === 'string' ? undefined : 'A label is required',
  toHtml: (block, ctx) => `<section data-product="${ctx.escape((block.content as any).label)}"></section>`,
  fromHtml: { selector: '[data-product]', parse: (element, ctx) => ctx.createBlock('product', { label: element.getAttribute('data-product') }) }
} } };

describe('Unified custom block registration', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('registers creation, menu, editor, preview, JSON validation and HTML import/export together', async () => {
    TestBed.configureTestingModule({ imports: [ContentBuilderComponent], providers: [provideContentEditorConfig(config)] });
    const fixture = TestBed.createComponent(ContentBuilderComponent); fixture.componentRef.setInput('persistDraft', false);
    fixture.autoDetectChanges(); await fixture.whenStable();
    const builder = fixture.componentInstance;
    const block = builder.insertBlock('product', 0, {}, false);
    await fixture.whenStable();
    await expect.poll(() => fixture.nativeElement.querySelector('test-custom-editor')?.textContent).toBe('New product');
    expect(block.attrs?.['source']).toBe('custom');
    expect(builder.insertionSuggestions().some((item: any) => item.title === 'Product')).toBe(true);
    expect(contentEditorFromJson({ version: 1, blocks: [block] }, config).blocks[0]).toEqual(block);
    expect(() => contentEditorFromJson({ version: 1, blocks: [{ ...block, content: {} }] }, config)).toThrow('label');
    expect(contentEditorFromHtml(contentEditorToHtml({ version: 1, blocks: [block] }, config), config).blocks[0].content).toEqual({ label: 'New product' });
    const renderer = TestBed.createComponent(ContentEditorRenderer);
    renderer.componentRef.setInput('content', { version: 1, blocks: [block] }); renderer.autoDetectChanges(); await renderer.whenStable();
    expect(renderer.nativeElement.querySelector('test-custom-preview')?.textContent).toBe('Preview: New product');
  });

  it('inherits instance preview config inside Grid and Toggle without separate providers', async () => {
    TestBed.configureTestingModule({ imports: [ContentEditorRenderer] });
    const fixture = TestBed.createComponent(ContentEditorRenderer); fixture.componentRef.setInput('config', config);
    fixture.componentRef.setInput('content', { version: 1, blocks: [{ id: 'grid', type: 'grid', content: { cells: [
      { id: 'cell', blocks: [{ id: 'toggle', type: 'toggle', attrs: { settings: { expanded: true } }, content: { title: [], blocks: [{ id: 'custom', type: 'product', content: { label: 'Nested' } }] } }] }
    ] } }] });
    fixture.autoDetectChanges(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('test-custom-preview')?.textContent).toBe('Preview: Nested');
    expect(fixture.componentInstance.toHtml()).toContain('data-product="Nested"');
  });
});
