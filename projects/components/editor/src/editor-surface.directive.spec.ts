import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { basicTextEditorPlugin } from './basic-text.plugin';
import { NgsEditor, provideNgsEditor } from './editor';
import { NgsEditorSurface } from './editor-surface.directive';
import { getNgsEditorDocumentText } from './model';
import { withEditorPlugin } from './plugin';

@Component({
  imports: [NgsEditorSurface],
  providers: [
    provideNgsEditor(
      withEditorPlugin(basicTextEditorPlugin())
    )
  ],
  template: '<div ngsEditorSurface placeholder="Write"></div>'
})
class EditorSurfaceTestHost {
  readonly editor = inject(NgsEditor);
}

describe('NgsEditorSurface', () => {
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

    const surface = fixture.nativeElement.querySelector('[ngsEditorSurface]') as HTMLElement;
    expect(surface.getAttribute('contenteditable')).toBe('true');
    expect(surface.textContent).toBe('Hello');
  });

  it('renders the placeholder on the empty block that owns the caret', () => {
    const surface = fixture.nativeElement.querySelector('[ngsEditorSurface]') as HTMLElement;
    const paragraph = surface.querySelector('p') as HTMLElement;

    expect(surface.getAttribute('data-placeholder')).toBe('Write');
    expect(paragraph.getAttribute('data-ngs-editor-placeholder')).toBe('Write');
  });

  it('places an empty-surface click at the start of the placeholder block', () => {
    const surface = fixture.nativeElement.querySelector('[ngsEditorSurface]') as HTMLElement;
    const paragraph = surface.querySelector('p') as HTMLElement;
    const event = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });

    surface.dispatchEvent(event);

    const selection = document.getSelection();
    expect(event.defaultPrevented).toBe(true);
    expect(selection?.isCollapsed).toBe(true);
    expect(selection?.anchorNode === paragraph || paragraph.contains(selection?.anchorNode ?? null)).toBe(true);
  });

  it('handles beforeinput as an editor operation', () => {
    const surface = fixture.nativeElement.querySelector('[ngsEditorSurface]') as HTMLElement;
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

    expect(getNgsEditorDocumentText(fixture.componentInstance.editor.document())).toBe('A');
  });

  it('pastes plain text through the JSON model', () => {
    const surface = fixture.nativeElement.querySelector('[ngsEditorSurface]') as HTMLElement;
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

    expect(getNgsEditorDocumentText(fixture.componentInstance.editor.document())).toBe('First\nSecond');
    expect(fixture.componentInstance.editor.document().blocks).toHaveLength(2);
  });

  it('commits browser composition DOM back into the model', () => {
    const surface = fixture.nativeElement.querySelector('[ngsEditorSurface]') as HTMLElement;
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

    expect(getNgsEditorDocumentText(fixture.componentInstance.editor.document())).toBe('漢字');
    expect(fixture.componentInstance.editor.composing()).toBe(false);
  });

  it('exposes the browser range rectangle only for a selection inside the surface', () => {
    fixture.componentInstance.editor.insertText('Selected text');
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('[ngsEditorSurface]') as HTMLElement;
    const text = element.querySelector('p')?.firstChild;
    const surface = fixture.debugElement
      .query(By.directive(NgsEditorSurface))
      .injector.get(NgsEditorSurface);
    const range = document.createRange();
    range.setStart(text!, 0);
    range.setEnd(text!, 8);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);

    expect(surface.getSelectionRect()).not.toBeNull();

    document.getSelection()?.removeAllRanges();
    expect(surface.getSelectionRect()).toBeNull();
  });
});
