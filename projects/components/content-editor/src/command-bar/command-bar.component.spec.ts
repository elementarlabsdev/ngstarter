import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { OverlayContainer } from '@angular/cdk/overlay';
import { userEvent } from 'vitest/browser';
import { createNgsHeadlessEditorText, NgsHeadlessEditorText } from '@ngstarter-ui/components/headless-editor';
import { ContentEditorContentEditableDirective } from '../content-editor-content-editable.directive';
import { TextSelectionPopupDirective } from '../text-selection-popup.directive';
import '../../../../../node_modules/@angular/cdk/overlay-prebuilt.css';

import { provideContentEditor } from '../content-editor.plugin';
import { CommandBarComponent } from './command-bar.component';

describe('CommandBarComponent', () => {
  let component: CommandBarComponent;
  let fixture: ComponentFixture<CommandBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandBarComponent],
      providers: [provideContentEditor()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Component({
  imports: [ContentEditorContentEditableDirective, TextSelectionPopupDirective],
  providers: [provideContentEditor()],
  template: `<div ngsTextSelectionPopup [targetComponent]="toolbar"
    closestContentObserverClass="ngs-content-editor-content-editable">
    <div [ngsContentEditorContentEditable]="content()" (contentChanged)="content.set($event)"></div>
  </div>`
})
class SelectionPopupHost {
  readonly toolbar = CommandBarComponent;
  readonly content = signal<readonly NgsHeadlessEditorText[]>([createNgsHeadlessEditorText('Hello world')]);
}

describe('Content editor toolbar overlays', () => {
  let fixture: ComponentFixture<SelectionPopupHost>;
  let region: ContentEditorContentEditableDirective;
  let surface: HTMLElement;
  let overlays: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [SelectionPopupHost] });
    fixture = TestBed.createComponent(SelectionPopupHost);
    fixture.nativeElement.style.display = 'block';
    fixture.nativeElement.style.paddingTop = '100px';
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const element = fixture.debugElement.query(By.directive(ContentEditorContentEditableDirective));
    region = element.injector.get(ContentEditorContentEditableDirective);
    surface = element.nativeElement;
    overlays = TestBed.inject(OverlayContainer).getContainerElement();
    overlays.style.setProperty('--ngs-button-height', '32px');
    region.region.editor.setSelection({ anchor: { blockId: 'line-0', offset: 0 }, focus: { blockId: 'line-0', offset: 5 } });
    region.focus();
    surface.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    await expect.poll(() => overlays.querySelector('ngs-command-bar')).toBeTruthy();
  });
  afterEach(() => TestBed.resetTestingModule());

  function toolbarButton(index: number): HTMLElement {
    return overlays.querySelectorAll<HTMLElement>('ngs-command-bar button[ngsIconButton]')[index];
  }

  it.each(['left', 'right'])('centers the toolbar over %s-aligned text and keeps it centered on scroll', async alignment => {
    fixture.nativeElement.style.marginLeft = '35vw';
    fixture.nativeElement.style.width = '30vw';
    surface.style.textAlign = alignment;
    region.region.editor.setSelection({ anchor: { blockId: 'line-0', offset: 0 }, focus: { blockId: 'line-0', offset: 11 } });
    region.focus();
    surface.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    const centerDifference = () => {
      const selection = document.getSelection()!.getRangeAt(0).getBoundingClientRect();
      const toolbar = overlays.querySelector<HTMLElement>('ngs-command-bar')!.getBoundingClientRect();
      return Math.abs(toolbar.left + toolbar.width / 2 - selection.left - selection.width / 2);
    };
    await expect.poll(centerDifference).toBeLessThan(1);

    fixture.nativeElement.style.paddingTop = '150px';
    document.dispatchEvent(new Event('scroll'));
    await expect.poll(() => {
      const selection = document.getSelection()!.getRangeAt(0).getBoundingClientRect();
      const toolbar = overlays.querySelector<HTMLElement>('ngs-command-bar')!.getBoundingClientRect();
      return Math.abs(selection.top - toolbar.bottom - 8);
    }).toBeLessThan(1);
    expect(centerDifference()).toBeLessThan(1);
  });

  it('keeps the toolbar while navigating an alignment menu and restores the range after choosing', async () => {
    await userEvent.click(toolbarButton(8));
    await fixture.whenStable();
    const item = overlays.querySelector<HTMLElement>('button[ngs-menu-item]')!;
    item.focus();
    item.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(overlays.querySelector('ngs-command-bar')).toBeTruthy();
    await userEvent.click(item);
    await fixture.whenStable();
    expect(document.activeElement).toBe(surface);
    expect(document.getSelection()?.toString()).toBe('Hello');
  });

  it('applies colors to the saved range after the palette takes focus', async () => {
    await userEvent.click(toolbarButton(9));
    await fixture.whenStable();
    const palette = overlays.querySelector('ngs-text-color')!;
    const color = palette.querySelectorAll<HTMLElement>('button')[1];
    color.focus();
    // A sibling overlay can collapse the native selection inside the surface.
    const range = document.createRange();
    range.selectNodeContents(surface.querySelector('p')!);
    range.collapse(false);
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
    await fixture.whenStable();
    await userEvent.click(color);
    await fixture.whenStable();
    expect(fixture.componentInstance.content()).toEqual([
      createNgsHeadlessEditorText('Hello', [{ type: 'textColor', attrs: { color: '#7f7f7f' } }]),
      createNgsHeadlessEditorText(' world')
    ]);
    expect(document.getSelection()?.toString()).toBe('Hello');
    expect(overlays.querySelector('ngs-command-bar')).toBeTruthy();
  });

  it('keeps the editor range while typing and tabbing in the link dialog, then applies the link', async () => {
    await userEvent.click(toolbarButton(7));
    await fixture.whenStable();
    const input = overlays.querySelector<HTMLInputElement>('ngs-add-link input')!;
    await userEvent.fill(input, 'https://example.com');
    await userEvent.tab();
    await fixture.whenStable();
    expect(overlays.querySelector('ngs-command-bar')).toBeTruthy();
    expect(document.activeElement).not.toBe(surface);
    const add = [...overlays.querySelectorAll<HTMLButtonElement>('ngs-add-link button')].find(button => button.textContent?.trim() === 'Add')!;
    await userEvent.click(add);
    await fixture.whenStable();
    await expect.poll(() => overlays.querySelector('ngs-add-link')).toBeNull();
    expect(surface.querySelector('a')?.textContent).toBe('Hello');
    expect(surface.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(document.activeElement).toBe(surface);
    expect(document.getSelection()?.toString()).toBe('Hello');
  });

  it('restores the selected text when cancelling the link dialog', async () => {
    await userEvent.click(toolbarButton(7));
    await fixture.whenStable();
    const input = overlays.querySelector<HTMLInputElement>('ngs-add-link input')!;
    await userEvent.fill(input, 'https://example.com');
    const cancel = [...overlays.querySelectorAll<HTMLButtonElement>('ngs-add-link button')].find(button => button.textContent?.trim() === 'Cancel')!;
    await userEvent.click(cancel);
    await fixture.whenStable();
    await expect.poll(() => overlays.querySelector('ngs-add-link')).toBeNull();
    expect(surface.querySelector('a')).toBeNull();
    expect(document.activeElement).toBe(surface);
    expect(document.getSelection()?.toString()).toBe('Hello');
  });
});
