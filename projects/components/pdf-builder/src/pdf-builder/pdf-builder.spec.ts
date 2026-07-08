import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { PdfBuilder } from './pdf-builder';

describe('PdfBuilder', () => {
  let component: PdfBuilder;
  let fixture: ComponentFixture<PdfBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfBuilder],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with a clean PDF canvas without prepared fields', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      fields: () => readonly unknown[];
      selectedField: () => unknown;
      selectedObjects: () => readonly unknown[];
    };

    expect(state.fields()).toEqual([]);
    expect(state.selectedField()).toBeNull();
    expect(state.selectedObjects()).toEqual([]);
    expect(element.querySelectorAll('.overlay-field').length).toBe(0);
    expect(element.textContent).toContain('0 fields');
  });

  it('adds a blank page and selects it', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      activePage: () => number;
      addBlankPage: () => void;
      addedPageCount: () => number;
      pageCount: () => number;
    };

    expect(state.pageCount()).toBe(2);

    state.addBlankPage();
    fixture.detectChanges();

    expect(state.addedPageCount()).toBe(1);
    expect(state.pageCount()).toBe(3);
    expect(state.activePage()).toBe(3);
    expect(element.querySelectorAll('.page-thumbnail').length).toBe(3);
    expect(element.querySelector('.blank-pdf-page')).not.toBeNull();
  });

  it('uses compact canvas metrics for signature fields', () => {
    const state = component as unknown as {
      addField: (type: 'signature') => void;
      fields: () => readonly { label: string; width: number; height: number }[];
    };

    state.addField('signature');
    fixture.detectChanges();

    expect(state.fields()[0]).toMatchObject({
      label: 'Signature',
      width: 154,
      height: 42,
    });
  });

  it('uses lower canvas metrics for initials fields', () => {
    const state = component as unknown as {
      addField: (type: 'initials') => void;
      fields: () => readonly { label: string; width: number; height: number }[];
    };

    state.addField('initials');
    fixture.detectChanges();

    expect(state.fields()[0]).toMatchObject({
      label: 'Initials',
      width: 105,
      height: 42,
    });
  });

  it('uses a slightly wider than tall canvas shape for stamp fields', () => {
    const state = component as unknown as {
      addField: (type: 'stamp') => void;
      fields: () => readonly { label: string; width: number; height: number }[];
    };

    state.addField('stamp');
    fixture.detectChanges();

    expect(state.fields()[0]).toMatchObject({
      label: 'Stamp',
      width: 120,
      height: 96,
    });
    expect(state.fields()[0].width).toBeGreaterThan(state.fields()[0].height);
  });

  it('shows one resize handle only for expandable selected fields', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'text' | 'variable') => void;
    };

    state.addField('text');
    fixture.detectChanges();

    const textHandles = element.querySelectorAll('.resize-handle');

    expect(textHandles.length).toBe(1);
    expect(textHandles[0].classList.contains('handle-se')).toBe(true);
    expect(element.querySelector('.handle-nw')).toBeNull();
    expect(element.querySelector('.handle-ne')).toBeNull();
    expect(element.querySelector('.handle-sw')).toBeNull();

    state.addField('variable');
    fixture.detectChanges();

    expect(element.querySelector('.resize-handle')).toBeNull();
  });

  it('resizes expandable fields from the bottom-right handle inside page bounds', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'text') => void;
      fields: () => readonly { id: string; x: number; y: number; width: number; height: number }[];
      fieldDrag: () => unknown;
      fieldResize: () => unknown;
    };

    state.addField('text');
    fixture.detectChanges();

    const pageShell = element.querySelector<HTMLElement>('.pdf-page-shell[data-page-number="1"]');

    expect(pageShell).not.toBeNull();

    pageShell!.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 595.276,
      bottom: 841.89,
      width: 595.276,
      height: 841.89,
      toJSON: () => undefined,
    });

    const field = state.fields()[0];
    const handle = element.querySelector<HTMLElement>('.resize-handle.handle-se');

    expect(handle).not.toBeNull();

    handle!.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: field.x + field.width,
      clientY: field.y + field.height,
      pointerId: 2,
    }));
    fixture.detectChanges();

    expect(state.fieldResize()).not.toBeNull();
    expect(state.fieldDrag()).toBeNull();

    window.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: field.x + field.width + 1000,
      clientY: field.y + field.height + 1000,
      pointerId: 2,
    }));
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: field.x + field.width + 1000,
      clientY: field.y + field.height + 1000,
      pointerId: 2,
    }));
    fixture.detectChanges();

    const resizedField = state.fields()[0];

    expect(resizedField.width).toBe(Math.round(595.276 - field.x));
    expect(resizedField.height).toBe(Math.round(841.89 - field.y));
    expect(state.fieldResize()).toBeNull();
  });

  it('drags fields inside page bounds without showing the selection toolbar while moving', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'text') => void;
      fields: () => readonly { id: string; x: number; y: number; width: number; height: number }[];
      fieldDrag: () => unknown;
    };

    state.addField('text');
    fixture.detectChanges();

    const pageShell = element.querySelector<HTMLElement>('.pdf-page-shell[data-page-number="1"]');

    expect(pageShell).not.toBeNull();

    pageShell!.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 595.276,
      bottom: 841.89,
      width: 595.276,
      height: 841.89,
      toJSON: () => undefined,
    });

    const field = state.fields()[0];
    const overlayField = element.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`);

    expect(overlayField).not.toBeNull();

    overlayField!.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: field.x,
      clientY: field.y,
      pointerId: 1,
    }));
    fixture.detectChanges();

    expect(state.fieldDrag()).not.toBeNull();
    expect(element.querySelector('.selection-toolbar')).toBeNull();

    window.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: 2000,
      clientY: 2000,
      pointerId: 1,
    }));
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: 2000,
      clientY: 2000,
      pointerId: 1,
    }));
    fixture.detectChanges();

    const draggedField = state.fields()[0];

    expect(draggedField.x).toBe(Math.round(595.276 - draggedField.width));
    expect(draggedField.y).toBe(Math.round(841.89 - draggedField.height));
    expect(state.fieldDrag()).toBeNull();
  });
});
