import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  createNgsHeadlessEditorDocument,
  getNgsHeadlessEditorDocumentText,
  NgsHeadlessEditorSurface
} from '@ngstarter-ui/components/headless-editor';
import { serializeCommentEditorDocument } from '../comment-editor-serializer';
import { CommentEditor } from './comment-editor';

describe('CommentEditor', () => {
  let fixture: ComponentFixture<CommentEditor>;
  let component: CommentEditor;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentEditor]
    }).compileComponents();
    fixture = TestBed.createComponent(CommentEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('restores full-view and toolbar state while keeping the signal editor', () => {
    expect(component.api.isEditorActivated()).toBe(false);
    expect(component.api.isToolbarActive()).toBe(false);

    component.api.showFullView();
    component.api.showToolbar();
    fixture.detectChanges();

    expect(component.api.isEditorActivated()).toBe(true);
    expect(component.api.isToolbarActive()).toBe(true);
    expect(fixture.nativeElement.querySelector('.toolbar')).not.toBeNull();
  });

  it('aligns the empty placeholder block with the collapsed footer controls', () => {
    const surface = fixture.nativeElement.querySelector('.content') as HTMLElement;
    const paragraph = surface.querySelector('[data-ngs-headless-editor-placeholder]') as HTMLElement;
    const surfaceStyles = getComputedStyle(surface);
    const paragraphStyles = getComputedStyle(paragraph);
    const expectedTop = Number.parseFloat(surfaceStyles.paddingTop);
    const actualTop = paragraph.getBoundingClientRect().top - surface.getBoundingClientRect().top;

    expect(paragraphStyles.marginTop).toBe('0px');
    expect(actualTop).toBeCloseTo(expectedTop, 0);
  });

  it('keeps expanded content padding equal on every side', () => {
    component.api.showFullView();
    fixture.detectChanges();

    const surface = fixture.nativeElement.querySelector('.content') as HTMLElement;
    const paragraph = surface.querySelector('[data-ngs-headless-editor-placeholder]') as HTMLElement;
    const surfaceRect = surface.getBoundingClientRect();
    const paragraphRect = paragraph.getBoundingClientRect();
    const styles = getComputedStyle(surface);
    const topSpace = paragraphRect.top - surfaceRect.top;
    const bottomSpace = surfaceRect.bottom - paragraphRect.bottom;

    expect(styles.boxSizing).toBe('border-box');
    expect(styles.paddingTop).toBe(styles.paddingLeft);
    expect(styles.paddingBottom).toBe(styles.paddingRight);
    expect(topSpace).toBeCloseTo(Number.parseFloat(styles.paddingLeft), 0);
    expect(bottomSpace).toBeCloseTo(Number.parseFloat(styles.paddingRight), 0);
  });

  for (const value of ['Hello', '🔥']) {
    it(`places the caret after programmatically inserted ${value}`, async () => {
      component.api.insertText(value);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const editorSelection = component.editor.selection();
      const nativeSelection = document.getSelection();
      const surface = fixture.nativeElement.querySelector('.content') as HTMLElement;

      expect(editorSelection?.anchor.offset).toBe(value.length);
      expect(editorSelection?.focus.offset).toBe(value.length);
      expect(nativeSelection?.isCollapsed).toBe(true);
      expect(surface.contains(nativeSelection?.anchorNode ?? null)).toBe(true);
      expect(getNativeSelectionOffset(surface, nativeSelection)).toBe(value.length);
    });
  }

  it('emits JSON and serialized HTML and clears after send', () => {
    const submitted: unknown[] = [];
    const sent: string[] = [];
    component.submitted.subscribe(value => submitted.push(value));
    component.sent.subscribe(value => sent.push(value));
    component.editor.setDocument(createNgsHeadlessEditorDocument('Hello'));

    component.send();

    expect(submitted).toHaveLength(1);
    expect(sent).toEqual(['<p>Hello</p>']);
    expect(getNgsHeadlessEditorDocumentText(component.editor.document())).toBe('');
  });

  it('keeps the legacy empty HTML output when empty content is explicitly allowed', () => {
    fixture.componentRef.setInput('allowEmptyContent', true);
    const sent: string[] = [];
    component.sent.subscribe(value => sent.push(value));

    component.send();

    expect(sent).toEqual(['']);
  });

  it('runs restored block commands through NgsHeadlessEditor', () => {
    component.editor.setDocument(createNgsHeadlessEditorDocument('Quote'));

    component.api.runCommand('toggleBlockquote');
    expect(component.editor.document().blocks[0].type).toBe('blockquote');
    expect(component.api.isActive('toggleBlockquote')).toBe(true);

    component.api.runCommand('toggleBlockquote');
    expect(component.editor.document().blocks[0].type).toBe('paragraph');
  });

  it('positions the floating menu from the current selection rectangle', () => {
    component.editor.setDocument(createNgsHeadlessEditorDocument('Selected'));
    const block = component.editor.document().blocks[0];
    component.editor.setSelection({
      anchor: { blockId: block.id, offset: 0 },
      focus: { blockId: block.id, offset: 8 }
    });
    component.editor.setFocused(true);
    fixture.detectChanges();

    const surface = (component as any).surface() as NgsHeadlessEditorSurface;
    vi.spyOn(surface, 'getSelectionRect').mockReturnValue(new DOMRect(100, 200, 80, 20));
    (component as any).positionBubbleMenu();

    const layer = fixture.nativeElement.querySelector('.bubble-menu-layer') as HTMLElement;
    expect(layer.classList.contains('bubble-menu-positioned')).toBe(true);
    expect(layer.style.left).toBe('140px');
    expect(layer.style.top).toBe('200px');
    expect(getComputedStyle(layer).position).toBe('fixed');
  });

  it('renders visible links without a Tiptap adapter and serializes their attributes', async () => {
    component.editor.setDocument(createNgsHeadlessEditorDocument('NgStarter'));
    const block = component.editor.document().blocks[0];
    component.editor.setSelection({
      anchor: { blockId: block.id, offset: 0 },
      focus: { blockId: block.id, offset: 9 }
    });

    expect(component.api.setLink('ngstarter.dev')).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const anchor = fixture.nativeElement.querySelector(
      '.content a[data-ngs-headless-editor-mark="link"]'
    ) as HTMLAnchorElement;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });

    expect(anchor).not.toBeNull();
    expect(anchor.textContent).toBe('NgStarter');
    expect(anchor.getAttribute('href')).toBe('https://ngstarter.dev');
    expect(getComputedStyle(anchor).textDecorationLine).toContain('underline');
    anchor.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(component.api.isActive('link')).toBe(true);
    expect(serializeCommentEditorDocument(component.editor.document())).toContain(
      '<a href="https://ngstarter.dev" target="_blank" rel="noopener noreferrer">NgStarter</a>'
    );
  });

  it('never serializes an unsafe href from stored JSON', () => {
    const html = serializeCommentEditorDocument({
      version: 1,
      blocks: [{
        id: 'paragraph-unsafe-link',
        type: 'paragraph',
        content: [{
          type: 'text',
          text: 'Click',
          marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }]
        }]
      }]
    });

    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('href="https://javascript:alert(1)"');
  });

  it('renders, serializes, and removes text and background colors', async () => {
    component.editor.setDocument(createNgsHeadlessEditorDocument('Colored'));
    const block = component.editor.document().blocks[0];
    component.editor.setSelection({
      anchor: { blockId: block.id, offset: 0 },
      focus: { blockId: block.id, offset: 7 }
    });

    expect(component.api.setTextColor('#be123c')).toBe(true);
    expect(component.api.setBackgroundColor('#fef08a')).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const textColor = fixture.nativeElement.querySelector(
      '.content [data-ngs-headless-editor-mark="textColor"]'
    ) as HTMLElement;
    const backgroundColor = fixture.nativeElement.querySelector(
      '.content [data-ngs-headless-editor-mark="backgroundColor"]'
    ) as HTMLElement;
    const html = serializeCommentEditorDocument(component.editor.document());

    expect(textColor.style.color).toBe('rgb(190, 18, 60)');
    expect(backgroundColor.style.backgroundColor).toBe('rgb(254, 240, 138)');
    expect(html).toContain('style="color: #be123c"');
    expect(html).toContain('style="background-color: #fef08a"');
    expect(component.api.getMarkAttributes('textColor')).toEqual({ color: '#be123c' });

    expect(component.api.unsetTextColor()).toBe(true);
    expect(component.api.unsetBackgroundColor()).toBe(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-ngs-headless-editor-mark="textColor"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-ngs-headless-editor-mark="backgroundColor"]')).toBeNull();
  });

  it('inserts YouTube as a JSON media block', () => {
    expect(component.api.insertYoutube('https://youtu.be/dQw4w9WgXcQ')).toBe(true);

    const youtube = component.editor.document().blocks.find(block => block.type === 'youtube');
    expect(youtube?.attrs?.['src']).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(component.editor.empty()).toBe(false);
  });

  it('replaces an image upload placeholder with the resolved image block', async () => {
    fixture.componentRef.setInput('imageUploadFn', () => Promise.resolve('/uploads/photo.png'));
    component.insertImage(new File(['image'], 'photo.png', { type: 'image/png' }));

    await waitFor(() => component.editor.document().blocks.some(block => block.type === 'image'));

    const image = component.editor.document().blocks.find(block => block.type === 'image');
    expect(image?.attrs?.['src']).toBe('/uploads/photo.png');
    expect(image?.attrs?.['alt']).toBe('photo.png');
  });

  it('keeps the image preview and error state when upload rejects', async () => {
    fixture.componentRef.setInput(
      'imageUploadFn',
      () => Promise.reject(new Error('Upload unavailable'))
    );
    component.insertImage(new File(['image'], 'photo.png', { type: 'image/png' }));

    await waitFor(() => component.editor.document().blocks.some(
      block => block.type === 'imageUpload' && block.attrs?.['status'] === 'error'
    ));

    const upload = component.editor.document().blocks.find(block => block.type === 'imageUpload');
    expect(upload?.attrs?.['src']).toContain('data:image/png;base64,');
    expect(upload?.attrs?.['error']).toBe('Upload unavailable');
  });
});

async function waitFor(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (predicate()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  throw new Error('Timed out waiting for asynchronous editor state');
}

function getNativeSelectionOffset(
  surface: HTMLElement,
  selection: Selection | null
): number | null {
  if (!selection?.anchorNode) {
    return null;
  }
  const range = document.createRange();
  range.selectNodeContents(surface);
  range.setEnd(selection.anchorNode, selection.anchorOffset);
  return range.toString().length;
}
