import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { WhiteboardElement, WhiteboardTool } from '../whiteboard.models';
import { Whiteboard } from './whiteboard';

describe('Whiteboard Angular integration', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Whiteboard] }).compileComponents();
  });
  afterEach(() => TestBed.resetTestingModule());

  it('reacts to tool and readonly signal changes after canvas initialization', async () => {
    const fixture = TestBed.createComponent(Whiteboard);
    fixture.componentRef.setInput('showToolbar', false);
    fixture.detectChanges(); await fixture.whenStable();
    const canvas = fixture.nativeElement.querySelector('.canvas') as HTMLElement;
    fixture.componentInstance.tool.set('rectangle');
    fixture.detectChanges(); await fixture.whenStable();
    expect(canvas.dataset['tool']).toBe('rectangle');
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges(); await fixture.whenStable();
    expect(canvas.dataset['tool']).toBe('hand');
    expect(canvas.querySelectorAll('canvas')).toHaveLength(2);
    fixture.destroy();
    expect(canvas.querySelectorAll('canvas')).toHaveLength(0);
  });

  it('loads external documents, resets history and guards imports in readonly mode', async () => {
    const fixture = TestBed.createComponent(Whiteboard);
    fixture.componentRef.setInput('showToolbar', false);
    fixture.detectChanges(); await fixture.whenStable();
    const board = fixture.componentInstance;
    board.importJson('{"version":1,"elements":[]}');
    expect(board.canUndo()).toBe(false);
    expect(board.canRedo()).toBe(false);
    expect(JSON.parse(board.exportJson())).toEqual({ version: 1, elements: [] });
    expect(() => board.importJson('{"version":2,"elements":[]}')).toThrow();
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges(); await fixture.whenStable();
    expect(() => board.importJson('invalid')).not.toThrow();
    expect(board.value()).toEqual({ version: 1, elements: [] });
  });
  it('switches tools from the focused toolbar and restores the previous tool on Escape', async () => {
    const fixture = TestBed.createComponent(Whiteboard);
    fixture.detectChanges(); await fixture.whenStable();
    const toolbarButton = fixture.nativeElement.querySelector('button.tool-lock') as HTMLButtonElement;
    const board = fixture.componentInstance;
    const press = (key: string, options: KeyboardEventInit = {}) =>
      toolbarButton.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }));
    press('r');
    expect(board.tool()).toBe('rectangle');
    press('e', { ctrlKey: true });
    expect(board.tool()).toBe('rectangle');
    press('e');
    expect(board.tool()).toBe('eraser');
    press('Escape');
    expect(board.tool()).toBe('rectangle');
  });
  it('shows only the property groups supported by the active tool', async () => {
    const fixture = TestBed.createComponent(Whiteboard);
    const host: HTMLElement = fixture.nativeElement;
    const stroke = ['Stroke width', 'Line style', 'Opacity'];
    const typography = ['Font family', 'Font size', 'Text alignment', 'Opacity'];
    const shapes = ['Stroke color', 'Fill', ...stroke];
    const groups = {
      pencil: ['Stroke color', ...stroke],
      line: ['Stroke color', ...stroke],
      arrow: ['Stroke color', 'Arrowhead color', ...stroke],
      rectangle: shapes,
      diamond: shapes,
      ellipse: shapes,
      text: ['Text color', ...typography],
      note: ['Text color', 'Fill', ...typography],
      hand: [],
      eraser: [],
      select: [],
    } satisfies Record<WhiteboardTool, string[]>;

    for (const [tool, expected] of Object.entries(groups)) {
      fixture.componentRef.setInput('tool', tool);
      fixture.detectChanges(); await fixture.whenStable();
      const panel = host.querySelector('.properties-panel');
      expect(!!panel, tool).toBe(!!expected.length);
      const labels = Array.from(panel?.querySelectorAll('.property-label') ?? [], label => label.textContent.trim());
      expect(labels, tool).toEqual(expected);
      if (tool === 'pencil') expect(panel?.querySelectorAll('ngs-segmented')).toHaveLength(2);
    }
  });
  it('shows common properties for selected objects and respects pressure strokes', async () => {
    const fixture = TestBed.createComponent(Whiteboard);
    const host: HTMLElement = fixture.nativeElement;
    const rectangle: WhiteboardElement = {
      ...fixture.componentInstance.drawingStyle(), id: 'rect', type: 'rectangle', x: 10, y: 10, width: 60, height: 40,
    };
    const pencil: WhiteboardElement = {
      ...rectangle, id: 'pen', type: 'pencil', points: [0, 0, 60, 40], pressures: [0.3, 0.8],
    };
    const selectAll = async (elements: WhiteboardElement[]) => {
      fixture.componentRef.setInput('value', { version: 1, elements });
      fixture.detectChanges(); await fixture.whenStable();
      host.querySelector('.canvas')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
      fixture.detectChanges(); await fixture.whenStable();
      return Array.from(host.querySelectorAll('.properties-panel .property-label'), label => label.textContent.trim());
    };

    expect(await selectAll([rectangle])).toEqual(['Stroke color', 'Fill', 'Stroke width', 'Line style', 'Opacity']);
    expect(await selectAll([rectangle, pencil])).toEqual(['Stroke color', 'Stroke width', 'Opacity']);
    expect(await selectAll([pencil])).toEqual(['Stroke color', 'Stroke width', 'Opacity']);
  });
  it('edits a note on the canvas and handles save and cancel shortcuts', async () => {
    const fixture = TestBed.createComponent(Whiteboard);
    fixture.componentRef.setInput('tool', 'note');
    fixture.detectChanges(); await fixture.whenStable();
    const board = fixture.componentInstance;
    const openNote = async () => {
      const content = fixture.nativeElement.querySelector('.konvajs-content') as HTMLElement;
      const bounds = content.getBoundingClientRect();
      for (const type of ['pointerdown', 'pointerup']) {
        content.dispatchEvent(new PointerEvent(type, {
          bubbles: true, pointerId: 1, clientX: bounds.left + 20, clientY: bounds.top + 20,
        }));
      }
      fixture.detectChanges(); await fixture.whenStable();
      return fixture.nativeElement.querySelector('textarea.text-editor') as HTMLTextAreaElement;
    };
    const first = await openNote();
    expect(first).toBeInstanceOf(HTMLTextAreaElement);
    expect(document.activeElement).toBe(first);
    first.value = 'Discarded';
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(board.value().elements).toHaveLength(0);

    const second = await openNote();
    const host: HTMLElement = fixture.nativeElement;
    const large = host.querySelector<HTMLButtonElement>('button[aria-label="Large"]')!;
    const right = host.querySelector<HTMLButtonElement>('button[aria-label="Align right"]')!;
    large.click();
    right.click();
    fixture.detectChanges();
    expect(second.style.fontSize).toBe('32px');
    expect(second.style.textAlign).toBe('right');
    second.value = 'Hello\nwhiteboard';
    second.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea.text-editor')).toBeNull();
    expect(board.value().elements[0]).toMatchObject({
      type: 'note', text: 'Hello\nwhiteboard', fontSize: 32, textAlign: 'right',
    });
    expect(board.selectedElements()).toEqual(board.value().elements);
    expect(board.canUndo()).toBe(true);
  });
  it('adds text at the canvas click and commits multiline text on blur', async () => {
    const fixture = TestBed.createComponent(Whiteboard);
    fixture.componentRef.setInput('tool', 'text');
    fixture.componentRef.setInput('showToolbar', false);
    fixture.detectChanges(); await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const canvas = host.querySelector<HTMLElement>('.canvas')!;
    const content = canvas.querySelector<HTMLElement>('.konvajs-content')!;
    const bounds = content.getBoundingClientRect();
    for (const type of ['pointerdown', 'pointerup']) {
      content.dispatchEvent(new PointerEvent(type, {
        bubbles: true, pointerId: 1, clientX: bounds.left + 20, clientY: bounds.top + 30,
      }));
    }
    fixture.detectChanges(); await fixture.whenStable();
    const editor = host.querySelector<HTMLTextAreaElement>('textarea.text-editor')!;
    expect(document.activeElement).toBe(editor);
    expect(editor.style.transform).toContain('translate(20px, 30px)');
    const initialHeight = parseFloat(editor.style.height);
    // Make the browser wrap differently from the canvas measurement.
    editor.style.letterSpacing = '4px';
    const text = `${'фыа'.repeat(18)}\nSecond line`;
    editor.value = text;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(parseFloat(editor.style.height)).toBeGreaterThan(initialHeight);
    expect(editor.scrollHeight).toBe(editor.clientHeight);
    expect(editor.scrollTop).toBe(0);
    expect(fixture.componentInstance.value().elements).toHaveLength(0);

    canvas.focus();
    fixture.detectChanges();
    expect(host.querySelector('textarea.text-editor')).toBeNull();
    expect(fixture.componentInstance.value().elements[0]).toMatchObject({
      type: 'text', x: 20, y: 30, text,
    });
    expect(fixture.componentInstance.selectedElements()).toEqual(fixture.componentInstance.value().elements);
  });
  it('keeps the drawing surface when Angular replaces its reserved canvas DOM', async () => {
    const fixture = TestBed.createComponent(Whiteboard);
    fixture.componentRef.setInput('showToolbar', false);
    fixture.detectChanges(); await fixture.whenStable();
    const canvas = fixture.nativeElement.querySelector('.canvas') as HTMLElement;
    const content = canvas.querySelector('.konvajs-content');
    expect(canvas.querySelectorAll('canvas')).toHaveLength(2);
    canvas.replaceChildren();
    fixture.detectChanges(); await fixture.whenStable();
    expect(canvas.contains(content)).toBe(true);
    expect(canvas.querySelectorAll('canvas')).toHaveLength(2);
  });
});
