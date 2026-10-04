import { Component, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  createNgsHeadlessEditorText, NgsHeadlessEditor,
  NGS_HEADLESS_EDITOR_TOGGLE_BOLD, NGS_HEADLESS_EDITOR_SET_LINK,
  NGS_HEADLESS_EDITOR_SET_TEXT_COLOR, NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR
} from '@ngstarter-ui/components/headless-editor';
import { ContentEditorContentEditableDirective } from './content-editor-content-editable.directive';
import { provideContentEditor } from './content-editor.plugin';
import { ContentBuilderStore } from './content-builder.store';

@Component({
  imports: [ContentEditorContentEditableDirective],
  providers: [provideContentEditor(), ContentBuilderStore],
  template: `<div [ngsContentEditorContentEditable]="store.blocks()[0].content"
    [props]="store.blocks()[0].props ?? []" [singleLine]="true"
    (pressedEnter)="enterCount.update(increment)"
    (contentChanged)="store.updateBlock('p', { content: $event })"
    (propsChanged)="store.updateBlock('p', { props: $event })"></div>`
})
class InlineHost {
  readonly editor = inject(NgsHeadlessEditor);
  readonly store = inject(ContentBuilderStore);
  readonly enterCount = signal(0);
  readonly increment = (value: number) => value + 1;
  constructor() {
    this.store.setBlocks({ version: 1, blocks: [{ id: 'p', type: 'paragraph', content: [createNgsHeadlessEditorText('Hello')] }] });
  }
}

describe('Content editor headless inline region', () => {
  let fixture: ComponentFixture<InlineHost>;
  let directive: ContentEditorContentEditableDirective;
  let surface: HTMLElement;
  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [InlineHost] });
    fixture = TestBed.createComponent(InlineHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const element = fixture.debugElement.query(By.directive(ContentEditorContentEditableDirective));
    directive = element.injector.get(ContentEditorContentEditableDirective);
    surface = element.nativeElement;
    directive.activate();
    directive.region.editor.setSelection({ anchor: { blockId: 'line-0', offset: 0 }, focus: { blockId: 'line-0', offset: 5 } });
  });
  afterEach(() => TestBed.resetTestingModule());

  it('formats through the parent commands, saves marks, and restores undo into the DOM', async () => {
    const editor = fixture.componentInstance.editor;
    editor.execute(NGS_HEADLESS_EDITOR_TOGGLE_BOLD);
    await fixture.whenStable();
    expect(surface.querySelector('strong')?.textContent).toBe('Hello');
    expect(editor.document().blocks[0].content).toEqual([createNgsHeadlessEditorText('Hello', [{ type: 'bold' }])]);
    editor.undo();
    await fixture.whenStable();
    expect(surface.querySelector('strong')).toBeNull();
    editor.redo();
    await fixture.whenStable();
    expect(surface.querySelector('strong')?.textContent).toBe('Hello');
  });

  it('keeps links and both colors in the same structured text region', async () => {
    const editor = fixture.componentInstance.editor;
    editor.execute(NGS_HEADLESS_EDITOR_SET_LINK, { href: 'https://example.com', target: '_blank' });
    await fixture.whenStable();
    editor.execute(NGS_HEADLESS_EDITOR_SET_TEXT_COLOR, '#ff0000');
    await fixture.whenStable();
    editor.execute(NGS_HEADLESS_EDITOR_SET_BACKGROUND_COLOR, '#ffff00');
    await fixture.whenStable();
    const runs: any = editor.document().blocks[0].content;
    expect(runs[0].marks.map((mark: any) => mark.type)).toEqual(['backgroundColor', 'link', 'textColor']);
    expect(surface.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(surface.querySelector('a')?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('persists alignment in the parent document and undoes it', async () => {
    directive.setAlignment('right');
    await fixture.whenStable();
    expect(surface.classList.contains('align-right')).toBe(true);
    expect(fixture.componentInstance.editor.document().blocks[0].attrs?.['props']).toEqual([{ name: 'text-alignment', value: 'right' }]);
    fixture.componentInstance.editor.undo();
    await fixture.whenStable();
    expect(surface.classList.contains('align-right')).toBe(false);
  });

  it('keeps structural Enter with the builder and typing with the headless surface', async () => {
    surface.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(fixture.componentInstance.enterCount()).toBe(1);
    surface.focus();
    const text = surface.querySelector('p')?.firstChild as Node;
    const range = document.createRange();
    range.setStart(text, 5); range.collapse(true);
    const selection = document.getSelection();
    selection?.removeAllRanges(); selection?.addRange(range);
    surface.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: '!', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(surface.textContent).toBe('Hello!');
    fixture.componentInstance.editor.undo();
    await fixture.whenStable();
    expect(surface.textContent).toBe('Hello');
  });
});
