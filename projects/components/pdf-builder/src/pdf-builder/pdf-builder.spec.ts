import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PdfViewer } from '@ngstarter-ui/components/pdf-viewer';

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

  it('starts with a clean PDF canvas without fields', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      fields: () => readonly unknown[];
      selectedField: () => unknown;
    };

    expect(state.fields()).toEqual([]);
    expect(state.selectedField()).toBeNull();
    expect(element.querySelectorAll('.overlay-field').length).toBe(0);
    expect(element.textContent).toContain('0 fields');
    expect(element.textContent).not.toContain('Prepared fields');
    expect(element.textContent).not.toContain('Source');
  });

  it('does not expose a create blank PDF action in the builder chrome', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('[aria-label="Create blank PDF"]')).toBeNull();
    expect(element.textContent).not.toContain('Create blank PDF');
  });

  it('does not expose an upload PDF action in the builder chrome', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('[aria-label="Upload PDF"]')).toBeNull();
    expect(element.textContent).not.toContain('Upload PDF');
  });

  it('keeps fields and layers in the left panel sidebar', () => {
    const element: HTMLElement = fixture.nativeElement;
    const sidebar = element.querySelector<HTMLElement>('ngs-panel-sidebar.builder-library');

    expect(element.querySelector('ngs-panel-aside.builder-library')).toBeNull();
    expect(sidebar).not.toBeNull();
    expect(sidebar!.textContent).toContain('Fields');
    expect(sidebar!.textContent).toContain('Layers');
    expect(sidebar!.classList.contains('border-r')).toBe(true);
  });

  it('opens the PDF viewer style right panels for search and annotations', () => {
    const element: HTMLElement = fixture.nativeElement;
    const searchButton = element.querySelector<HTMLButtonElement>('[aria-label="Search PDF"]');
    const annotationsButton = element.querySelector<HTMLButtonElement>('[aria-label="Annotations"]');

    expect(searchButton).not.toBeNull();
    expect(annotationsButton).not.toBeNull();
    expect(element.querySelector('ngs-panel-aside.builder-viewer-aside')).toBeNull();

    searchButton!.click();
    fixture.detectChanges();

    const searchAside = element.querySelector<HTMLElement>('ngs-panel-aside.builder-viewer-aside');

    expect(searchAside).not.toBeNull();
    expect(searchAside!.classList.contains('border-l')).toBe(true);
    expect(searchAside!.className).toContain('w-[var(--ngs-pdf-viewer-aside-width)]');
    expect(searchAside!.querySelector('ngs-pdf-viewer-search')).not.toBeNull();
    expect(searchAside!.querySelector('ngs-tab-group')).toBeNull();

    annotationsButton!.click();
    fixture.detectChanges();

    const annotationsAside = element.querySelector<HTMLElement>('ngs-panel-aside.builder-viewer-aside');

    expect(annotationsAside).not.toBeNull();
    expect(annotationsAside!.querySelector('ngs-pdf-viewer-annotations')).not.toBeNull();
    expect(annotationsAside!.querySelector('ngs-pdf-viewer-search')).toBeNull();
  });

  it('selects layer fields without closing the tree and scrolls to the canvas field', async () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'signature') => void;
      activePage: () => number;
      expandedLayerNodeIds: () => ReadonlySet<string>;
      layerTree: () => readonly { id: string; children?: readonly { id: string }[] }[];
      selectLayerNode: (node: { id: string }, event?: Event) => void;
      selectedFieldId: () => string | null;
    };

    state.addField('signature');
    fixture.detectChanges();

    const fieldNode = state.layerTree()[0].children?.find(node => !node.id.includes('pdf-layer'));
    const overlayField = element.querySelector<HTMLElement>(`[data-field-id="${fieldNode?.id}"]`);
    let scrolledToField = false;
    let propagationStopped = false;

    expect(fieldNode).toBeDefined();
    expect(overlayField).not.toBeNull();

    overlayField!.scrollIntoView = () => {
      scrolledToField = true;
    };

    state.selectLayerNode(fieldNode!, {
      stopPropagation: () => {
        propagationStopped = true;
      },
    } as Event);

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    expect(propagationStopped).toBe(true);
    expect(state.selectedFieldId()).toBe(fieldNode!.id);
    expect(state.activePage()).toBe(1);
    expect(state.expandedLayerNodeIds().has('page-1')).toBe(true);
    expect(scrolledToField).toBe(true);
  });

  it('keeps layer expansion restored when scrolling changes the active page', async () => {
    const state = component as unknown as {
      activePage: { set: (page: number) => void };
      restoreLayerTreeExpansion: () => void;
    };
    let restoreCount = 0;

    state.restoreLayerTreeExpansion = () => {
      restoreCount += 1;
    };

    state.activePage.set(2);
    fixture.detectChanges();

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    expect(restoreCount).toBeGreaterThan(0);
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

  it('uses a thumbnail scale that keeps PDF pages inside the preview frame', () => {
    const thumbnailViewer = fixture.debugElement
      .queryAll(By.directive(PdfViewer))
      .find(item => item.nativeElement.classList.contains('thumbnail-pdf-viewer'))
      ?.componentInstance as PdfViewer | undefined;

    expect(thumbnailViewer).toBeDefined();
    expect(thumbnailViewer!.scale()).toBe(0.15);
  });

  it('renders the builder without zoom controls', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('[aria-label="Zoom out"]')).toBeNull();
    expect(element.querySelector('[aria-label="Zoom presets"]')).toBeNull();
    expect(element.querySelector('[aria-label="Zoom in"]')).toBeNull();
  });

  it('keeps portrait pages fixed to the max builder width', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      syncCanvasGeometry: () => void;
    };

    state.syncCanvasGeometry();

    const pageShell = element.querySelector<HTMLElement>('.pdf-page-shell');

    expect(pageShell).not.toBeNull();
    expect(pageShell!.style.getPropertyValue('--pdf-builder-page-width')).toBe('814px');
  });

  it('uses the same page shadow utility as the PDF viewer', () => {
    const element: HTMLElement = fixture.nativeElement;
    const pageShell = element.querySelector<HTMLElement>('.pdf-page-shell');

    expect(pageShell).not.toBeNull();
    expect(pageShell!.classList.contains('shadow-md')).toBe(true);
  });

  it('scales canvas fields with the fixed PDF page scale', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'signature') => void;
      fields: () => readonly { id: string; x: number; y: number; width: number; height: number }[];
      pdfScale: () => number;
      syncCanvasGeometry: () => void;
    };

    state.addField('signature');
    fixture.detectChanges();

    const field = state.fields()[0];
    const overlayField = element.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`);
    const scale = state.pdfScale();

    expect(overlayField).not.toBeNull();

    state.syncCanvasGeometry();

    expect(overlayField!.style.getPropertyValue('--pdf-builder-field-left')).toBe(`${field.x * scale}px`);
    expect(overlayField!.style.getPropertyValue('--pdf-builder-field-top')).toBe(`${field.y * scale}px`);
    expect(overlayField!.style.getPropertyValue('--pdf-builder-field-width')).toBe(`${field.width * scale}px`);
    expect(overlayField!.style.getPropertyValue('--pdf-builder-field-height')).toBe(`${field.height * scale}px`);
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
      height: 77,
    });
    expect(state.fields()[0].width).toBeGreaterThan(state.fields()[0].height);
  });

  it('renders checkbox fields as plain checkbox squares without canvas labels', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'checkbox') => void;
      fields: () => readonly { id: string; label: string; value: string; width: number; height: number }[];
    };

    state.addField('checkbox');
    fixture.detectChanges();

    const field = state.fields()[0];
    const checkbox = element.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`);

    expect(field).toMatchObject({
      label: 'Checkbox',
      value: '',
      width: 18,
      height: 18,
    });
    expect(checkbox).not.toBeNull();
    expect(checkbox!.textContent?.trim()).toBe('');
    expect(checkbox!.querySelector('.field-badge')).toBeNull();
    expect(checkbox!.querySelector('.field-value')).toBeNull();
  });

  it('activates text fields for inline typing on click', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'text') => void;
      editingFieldId: () => string | null;
      fields: () => readonly { id: string; height: number; value: string }[];
    };

    state.addField('text');
    fixture.detectChanges();

    const field = state.fields()[0];
    const overlayField = element.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`);

    expect(overlayField).not.toBeNull();
    expect(field.value).toBe('');
    expect(overlayField!.classList.contains('is-filled')).toBe(false);
    expect(overlayField!.textContent).toContain('Enter value');

    overlayField!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const editor = element.querySelector<HTMLElement>(`[contenteditable][data-text-editor-for="${field.id}"]`);

    expect(state.editingFieldId()).toBe(field.id);
    expect(editor).not.toBeNull();
    expect(editor!.getAttribute('contenteditable')).toBe('true');

    Object.defineProperty(editor!, 'scrollHeight', {
      configurable: true,
      value: 112,
    });
    editor!.textContent = 'Updated legal review note\nwith a second line';
    editor!.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(state.fields()[0].value).toBe('Updated legal review note\nwith a second line');
    expect(state.fields()[0].height).toBeGreaterThan(field.height);
    expect(overlayField!.classList.contains('is-filled')).toBe(true);

    editor!.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    fixture.detectChanges();

    expect(state.editingFieldId()).toBeNull();
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
