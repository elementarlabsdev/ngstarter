import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { basicTextEditorPlugin } from './basic-text.plugin';
import { NgsHeadlessEditor, provideNgsHeadlessEditor } from './headless-editor';
import { NgsHeadlessEditorSurface } from './headless-editor-surface.directive';
import { getNgsHeadlessEditorDocumentText, isNgsHeadlessEditorTextContent } from './model';
import { withHeadlessEditorPlugin } from './plugin';

@Component({
  imports: [NgsHeadlessEditorSurface],
  providers: [provideNgsHeadlessEditor(withHeadlessEditorPlugin(basicTextEditorPlugin()))],
  template: '<div ngsHeadlessEditorSurface></div>'
})
class KeyboardTestHost {
  readonly editor = inject(NgsHeadlessEditor);
}

/** Drives the surface with real browser key presses (trusted beforeinput events). */
describe('NgsHeadlessEditorSurface keyboard', () => {
  let fixture: ComponentFixture<KeyboardTestHost>;
  let surface: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KeyboardTestHost] }).compileComponents();
    fixture = TestBed.createComponent(KeyboardTestHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]');
    await userEvent.click(surface);
  });

  afterEach(() => TestBed.resetTestingModule());

  const text = () => getNgsHeadlessEditorDocumentText(fixture.componentInstance.editor.document());

  it('types, splits paragraphs and deletes characters', async () => {
    await userEvent.keyboard('Hello{Enter}world{Backspace}');
    await fixture.whenStable();

    expect(text()).toBe('Hello\nworl');
    expect(surface.querySelectorAll('p')).toHaveLength(2);
  });

  it('deletes the previous word with Ctrl+Backspace', async () => {
    await userEvent.keyboard('Hello brave world');
    await userEvent.keyboard('{Control>}{Backspace}{/Control}');
    await fixture.whenStable();

    expect(text()).toBe('Hello brave ');
  });

  it('undoes typing word by word with Ctrl+Z and redoes with Ctrl+Shift+Z', async () => {
    await userEvent.keyboard('one two');
    await userEvent.keyboard('{Control>}z{/Control}');
    await fixture.whenStable();
    expect(text()).toBe('one ');

    await userEvent.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');
    await fixture.whenStable();
    expect(text()).toBe('one two');
  });

  it('applies bold from the keyboard to the following text', async () => {
    await userEvent.keyboard('a{Control>}b{/Control}b');
    await fixture.whenStable();

    const content = fixture.componentInstance.editor.document().blocks[0].content;
    expect(isNgsHeadlessEditorTextContent(content) && content.map(run => run.marks.map(m => m.type))).toEqual([[], ['bold']]);
    expect(surface.querySelector('strong')?.textContent).toBe('b');
  });
});
