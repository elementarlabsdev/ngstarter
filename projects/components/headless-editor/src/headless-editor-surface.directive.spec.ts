import { Component, inject, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { basicTextEditorPlugin } from './basic-text.plugin';
import { NgsHeadlessEditor, provideNgsHeadlessEditor } from './headless-editor';
import { NgsHeadlessEditorSurface } from './headless-editor-surface.directive';
import {
  createNgsHeadlessEditorId,
  createNgsHeadlessEditorParagraph,
  getNgsHeadlessEditorDocumentText,
  NgsHeadlessEditorBlock
} from './model';
import { defineNgsHeadlessEditorPlugin, withHeadlessEditorPlugin } from './plugin';

@Component({
  imports: [NgsHeadlessEditorSurface],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin())
    )
  ],
  template: '<div ngsHeadlessEditorSurface placeholder="Write"></div>'
})
class EditorSurfaceTestHost {
  readonly editor = inject(NgsHeadlessEditor);
}

describe('NgsHeadlessEditorSurface', () => {
  let fixture: ComponentFixture<EditorSurfaceTestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorSurfaceTestHost]
    }).compileComponents();
    fixture = TestBed.createComponent(EditorSurfaceTestHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('renders the signal document into a contenteditable surface', () => {
    fixture.componentInstance.editor.insertText('Hello');
    fixture.detectChanges();

    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    expect(surface.getAttribute('contenteditable')).toBe('true');
    expect(surface.textContent).toBe('Hello');
  });

  it('renders the placeholder on the empty block that owns the caret', () => {
    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    const paragraph = surface.querySelector('p') as HTMLElement;

    expect(surface.getAttribute('data-placeholder')).toBe('Write');
    expect(paragraph.getAttribute('data-ngs-headless-editor-placeholder')).toBe('Write');
  });

  it('places an empty-surface click at the start of the placeholder block', () => {
    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    const paragraph = surface.querySelector('p') as HTMLElement;
    const event = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });

    surface.dispatchEvent(event);

    const selection = document.getSelection();
    expect(event.defaultPrevented).toBe(true);
    expect(selection?.isCollapsed).toBe(true);
    expect(selection?.anchorNode === paragraph || paragraph.contains(selection?.anchorNode ?? null)).toBe(true);
  });

  it('handles beforeinput as an editor operation', () => {
    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    surface.focus();
    const paragraph = surface.querySelector('p') as HTMLElement;
    const selection = document.getSelection();
    const range = document.createRange();
    range.setStart(paragraph, 0);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    surface.dispatchEvent(new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: 'A'
    }));
    fixture.detectChanges();

    expect(getNgsHeadlessEditorDocumentText(fixture.componentInstance.editor.document())).toBe('A');
  });

  it('pastes plain text through the JSON model', () => {
    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    const paragraph = surface.querySelector('p') as HTMLElement;
    surface.focus();
    const range = document.createRange();
    range.setStart(paragraph, 0);
    range.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', 'First\nSecond');
    surface.dispatchEvent(new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData
    }));

    expect(getNgsHeadlessEditorDocumentText(fixture.componentInstance.editor.document())).toBe('First\nSecond');
    expect(fixture.componentInstance.editor.document().blocks).toHaveLength(2);
  });

  it('commits browser composition DOM back into the model', () => {
    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    const paragraph = surface.querySelector('p') as HTMLElement;
    surface.focus();
    surface.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    paragraph.textContent = '漢字';

    const range = document.createRange();
    range.selectNodeContents(paragraph);
    range.collapse(false);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    surface.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '漢字' }));

    expect(getNgsHeadlessEditorDocumentText(fixture.componentInstance.editor.document())).toBe('漢字');
    expect(fixture.componentInstance.editor.composing()).toBe(false);
  });

  it('exposes the browser range rectangle only for a selection inside the surface', () => {
    fixture.componentInstance.editor.insertText('Selected text');
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    const text = element.querySelector('p')?.firstChild;
    const surface = fixture.debugElement
      .query(By.directive(NgsHeadlessEditorSurface))
      .injector.get(NgsHeadlessEditorSurface);
    const range = document.createRange();
    range.setStart(text!, 0);
    range.setEnd(text!, 8);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    expect(surface.getSelectionRect()).not.toBeNull();

    document.getSelection()?.removeAllRanges();
    expect(surface.getSelectionRect()).toBeNull();
  });

  function dispatchBeforeInput(
    surface: HTMLElement,
    inputType: string,
    targetRange?: { startContainer: Node; startOffset: number; endContainer: Node; endOffset: number }
  ): InputEvent {
    const event = new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType });
    Object.defineProperty(event, 'getTargetRanges', {
      value: () => targetRange ? [targetRange] : []
    });
    surface.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  }

  function placeCaretAtEnd(surface: HTMLElement): Text {
    surface.focus();
    const text = surface.querySelector('p')?.firstChild as Text;
    const range = document.createRange();
    range.setStart(text, text.length);
    range.collapse(true);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    return text;
  }

  it('deletes the word range reported by the browser', () => {
    const editor = fixture.componentInstance.editor;
    editor.insertText('Hello world');
    fixture.detectChanges();
    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    const text = placeCaretAtEnd(surface);

    const event = dispatchBeforeInput(surface, 'deleteWordBackward', {
      startContainer: text,
      startOffset: 6,
      endContainer: text,
      endOffset: 11
    });

    expect(event.defaultPrevented).toBe(true);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('Hello ');
  });

  it('falls back to a single character when no target range is available', () => {
    const editor = fixture.componentInstance.editor;
    editor.insertText('Hello');
    fixture.detectChanges();
    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    placeCaretAtEnd(surface);

    dispatchBeforeInput(surface, 'deleteSoftLineBackward');

    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('Hell');
  });

  it('blocks browser formatting commands the model does not support', () => {
    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;

    expect(dispatchBeforeInput(surface, 'formatUnderline').defaultPrevented).toBe(true);
    expect(dispatchBeforeInput(surface, 'insertOrderedList').defaultPrevented).toBe(true);
    expect(dispatchBeforeInput(surface, 'insertTranspose').defaultPrevented).toBe(false);
  });

  function blockElements(): HTMLElement[] {
    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    return [...surface.children] as HTMLElement[];
  }

  it('patches only the blocks that changed', () => {
    const editor = fixture.componentInstance.editor;
    const blocks = ['One', 'Two', 'Three'].map(text => createNgsHeadlessEditorParagraph(text));
    editor.setDocument({ version: 1, blocks });
    fixture.detectChanges();
    const [first, second, third] = blockElements();

    editor.setSelection({
      anchor: { blockId: editor.document().blocks[1].id, offset: 3 },
      focus: { blockId: editor.document().blocks[1].id, offset: 3 }
    });
    editor.insertText('!');
    fixture.detectChanges();

    const after = blockElements();
    expect(after[0]).toBe(first);
    expect(after[2]).toBe(third);
    expect(after[1]).not.toBe(second);
    expect(after[1].textContent).toBe('Two!');

    editor.undo();
    fixture.detectChanges();
    expect(blockElements()[0]).toBe(first);
    expect(blockElements()[1].textContent).toBe('Two');
  });

  it('replaces browser-generated markup even when the text is unchanged', () => {
    const editor = fixture.componentInstance.editor;
    editor.insertText('Hello');
    fixture.detectChanges();
    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    const paragraph = surface.querySelector('p') as HTMLElement;

    paragraph.innerHTML = '<font color="red">Hello</font>';
    surface.append(document.createElement('div'));
    surface.dispatchEvent(new InputEvent('input', { bubbles: true }));

    expect(getNgsHeadlessEditorDocumentText(editor.document())).toBe('Hello');
    expect(surface.querySelector('font')).toBeNull();
    expect(surface.children).toHaveLength(1);
    expect(surface.querySelector('p')?.innerHTML).toBe('Hello');
  });
});

@Component({
  selector: 'test-widget-editor',
  template: '<span class="widget-editor">{{ block().attrs?.["label"] }}</span><input class="widget-input">'
})
class WidgetEditor {
  readonly block = input.required<NgsHeadlessEditorBlock>();
  readonly editor = inject(NgsHeadlessEditor);
}

@Component({
  selector: 'test-widget-renderer',
  template: '<span class="widget-renderer">{{ block().attrs?.["label"] }}</span>'
})
class WidgetRenderer {
  readonly block = input.required<NgsHeadlessEditorBlock>();
}

@Component({
  imports: [NgsHeadlessEditorSurface],
  providers: [
    provideNgsHeadlessEditor(
      withHeadlessEditorPlugin(basicTextEditorPlugin()),
      withHeadlessEditorPlugin(defineNgsHeadlessEditorPlugin({
        id: 'widget',
        blocks: [{
          type: 'widget',
          tagName: 'figure',
          editorComponent: WidgetEditor,
          rendererComponent: WidgetRenderer,
          create: () => ({ id: createNgsHeadlessEditorId('widget'), type: 'widget', content: null })
        }]
      }))
    )
  ],
  template: '<div ngsHeadlessEditorSurface></div>'
})
class ComponentBlockTestHost {
  readonly editor = inject(NgsHeadlessEditor);
}

describe('NgsHeadlessEditorSurface component blocks', () => {
  let fixture: ComponentFixture<ComponentBlockTestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentBlockTestHost]
    }).compileComponents();
    fixture = TestBed.createComponent(ComponentBlockTestHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('renders editorComponent blocks and keeps the instance across updates', async () => {
    const editor = fixture.componentInstance.editor;
    const widget: NgsHeadlessEditorBlock = {
      id: createNgsHeadlessEditorId('widget'),
      type: 'widget',
      content: null,
      attrs: { label: 'First' }
    };
    editor.insertBlock(widget);
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement.querySelector('figure') as HTMLElement;
    expect(host.getAttribute('contenteditable')).toBe('false');
    expect(host.querySelector('.widget-editor')?.textContent).toBe('First');

    editor.updateBlock(widget.id, { attrs: { label: 'Second' } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('figure')).toBe(host);
    expect(host.querySelector('.widget-editor')?.textContent).toBe('Second');
  });

  it('switches to rendererComponent while read-only', async () => {
    const editor = fixture.componentInstance.editor;
    editor.insertBlock({
      id: createNgsHeadlessEditorId('widget'),
      type: 'widget',
      content: null,
      attrs: { label: 'Preview' }
    });
    editor.setReadOnly(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement.querySelector('figure') as HTMLElement;
    expect(host.querySelector('.widget-editor')).toBeNull();
    expect(host.querySelector('.widget-renderer')?.textContent).toBe('Preview');
  });

  it('destroys component blocks that leave the document', async () => {
    const editor = fixture.componentInstance.editor;
    const widget: NgsHeadlessEditorBlock = { id: createNgsHeadlessEditorId('widget'), type: 'widget', content: null };
    editor.insertBlock(widget);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('figure')).not.toBeNull();

    editor.removeBlock(widget.id);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('figure')).toBeNull();
  });

  it('leaves input events of widgets inside component blocks alone', async () => {
    const editor = fixture.componentInstance.editor;
    editor.insertBlock({ id: createNgsHeadlessEditorId('widget'), type: 'widget', content: null });
    fixture.detectChanges();
    await fixture.whenStable();
    const before = editor.document();
    const field = fixture.nativeElement.querySelector('.widget-input') as HTMLInputElement;

    const beforeInput = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: 'x'
    });
    field.dispatchEvent(beforeInput);
    const keydown = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'b', ctrlKey: true });
    field.dispatchEvent(keydown);
    field.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));

    expect(beforeInput.defaultPrevented).toBe(false);
    expect(keydown.defaultPrevented).toBe(false);
    expect(editor.composing()).toBe(false);
    expect(editor.document()).toBe(before);
  });
});
