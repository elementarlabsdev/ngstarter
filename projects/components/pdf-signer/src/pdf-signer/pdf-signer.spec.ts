import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import type {
  PdfBuilderField,
  PdfBuilderSchema,
  PdfBuilderSigner,
} from '@ngstarter-ui/components/pdf-builder';

import { PdfSigner } from './pdf-signer';

describe('PdfSigner', () => {
  let component: PdfSigner;
  let fixture: ComponentFixture<PdfSigner>;

  const currentSigner: PdfBuilderSigner = {
    id: 'signer-current',
    fullName: 'Current Signer',
    email: 'current@example.com',
  };
  const otherSigner: PdfBuilderSigner = {
    id: 'signer-other',
    fullName: 'Other Signer',
    email: 'other@example.com',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfSigner],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfSigner);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('does not render recipients or recipient action menus', () => {
    setInputs(createSchema(), currentSigner);

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('[aria-label="Document recipients"]')).toBeNull();
    expect(element.querySelector('[aria-label="Recipient actions"]')).toBeNull();
    expect(element.querySelector('ngs-menu')).toBeNull();
    expect(element.textContent).not.toContain('Edit personal details');
    expect(element.textContent).not.toContain('Replace recipient');
  });

  it('shows the PDF Viewer page preview sidebar independently of builder view state', () => {
    setInputs(createSchema(), currentSigner);

    const element: HTMLElement = fixture.nativeElement;
    const sidebar = element.querySelector<HTMLElement>('ngs-panel-sidebar');
    const pageButton = element.querySelector<HTMLButtonElement>('[data-ngs-pdf-page-button="1"]');

    expect(sidebar).not.toBeNull();
    expect(sidebar?.querySelector('.pdf-viewer-sidebar')).not.toBeNull();
    expect(pageButton).not.toBeNull();
    expect(pageButton?.querySelector('.pdf-viewer-sidebar__thumb')).not.toBeNull();
    expect(getComputedStyle(pageButton!.querySelector('.pdf-viewer-sidebar__thumb')!).backgroundColor)
      .toBe('rgb(255, 255, 255)');
    expect(pageButton?.getAttribute('aria-current')).toBe('page');
  });

  it('hides the page preview sidebar only when showPageList is false', () => {
    fixture.componentRef.setInput('showPageList', false);
    setInputs(createSchema(), currentSigner);

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.pdf-viewer-sidebar')).toBeNull();
    expect(element.querySelector('[data-ngs-pdf-page-button]')).toBeNull();
  });

  it('attaches a warning marker to the page with the next global field and scrolls it into the viewport', async () => {
    const baseSchema = createSchema();
    const nextField = createField({
      id: 'page-two-date',
      type: 'date',
      label: 'Page two date',
      signer: currentSigner,
      page: 2,
      value: '',
      x: 32,
      y: 32,
      width: 160,
      height: 40,
    });
    const schema: PdfBuilderSchema = {
      ...baseSchema,
      document: {
        ...baseSchema.document,
        addedPageCount: 2,
        pages: [
          ...(baseSchema.document.pages ?? []),
          {
            id: 'virtual-2',
            kind: 'virtual',
            label: 'Page 2',
            width: 595.276,
            height: 841.89,
          },
        ],
      },
      fields: [
        ...baseSchema.fields.map(field => {
          if (field.id === 'current-text') {
            return { ...field, value: 'Completed' };
          }

          if (field.id === 'current-checkbox') {
            return { ...field, value: 'true' };
          }

          return field;
        }),
        nextField,
      ],
    };
    const state = component as unknown as {
      activePage: () => number;
    };

    setInputs(schema, currentSigner);

    const element: HTMLElement = fixture.nativeElement;
    const marker = element.querySelector<HTMLButtonElement>('[data-next-field-id="page-two-date"]');
    const scrollContainer = element.querySelector<HTMLElement>('.viewer-scrollbar .scrollable-content');
    const fieldElement = element.querySelector<HTMLElement>('[data-field-id="page-two-date"]');
    const scrollTo = vi.fn();

    expect(marker).not.toBeNull();
    expect(scrollContainer).not.toBeNull();
    expect(fieldElement).not.toBeNull();
    expect(marker?.closest('ngs-panel-content')).not.toBeNull();
    expect(marker?.closest('ngs-panel-sidebar')).toBeNull();

    Object.defineProperties(scrollContainer!, {
      clientWidth: { configurable: true, value: 600 },
      clientHeight: { configurable: true, value: 400 },
      scrollWidth: { configurable: true, value: 1200 },
      scrollHeight: { configurable: true, value: 2400 },
      scrollLeft: { configurable: true, value: 50, writable: true },
      scrollTop: { configurable: true, value: 100, writable: true },
      scrollTo: { configurable: true, value: scrollTo },
    });
    scrollContainer!.getBoundingClientRect = () => new DOMRect(200, 100, 600, 400);
    fieldElement!.getBoundingClientRect = () => new DOMRect(900, 1300, 100, 40);

    marker!.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    expect(state.activePage()).toBe(2);
    expect(document.activeElement).toBe(fieldElement);
    expect(scrollTo).toHaveBeenCalledWith({
      top: 1120,
      left: 500,
      behavior: 'smooth',
    });
  });

  it('shows all signer fields by default and makes only the current signer fields interactive', () => {
    setInputs(createSchema(), currentSigner);

    const element: HTMLElement = fixture.nativeElement;
    const currentField = element.querySelector<HTMLElement>('[data-field-id="current-text"]');
    const currentEditor = currentField?.querySelector<HTMLElement>('[data-text-editor-for="current-text"]');
    const otherField = element.querySelector<HTMLElement>('[data-field-id="other-text"]');

    expect(currentField).not.toBeNull();
    expect(currentField?.hasAttribute('role')).toBe(false);
    expect(currentEditor?.getAttribute('role')).toBe('textbox');
    expect(currentEditor?.getAttribute('contenteditable')).toBe('true');
    expect(currentField?.classList.contains('is-readonly')).toBe(false);
    expect(otherField).not.toBeNull();
    expect(otherField?.hasAttribute('role')).toBe(false);
    expect(otherField?.classList.contains('is-readonly')).toBe(true);
  });

  it('centers stamp content like signature content regardless of the field slot', () => {
    const schema = createSchema();
    const stamp = createField({
      id: 'current-stamp',
      type: 'stamp',
      label: 'Stamp',
      signer: currentSigner,
      slot: 'primary',
      value: '',
      x: 40,
      y: 272,
      width: 180,
      height: 64,
    });

    setInputs({
      ...schema,
      fields: [...schema.fields, stamp],
    }, currentSigner);

    const element: HTMLElement = fixture.nativeElement;
    const stampField = element.querySelector<HTMLElement>('[data-field-id="current-stamp"]');
    const style = getComputedStyle(stampField!);

    expect(stampField).not.toBeNull();
    expect(style.alignItems).toBe('center');
    expect(style.justifyContent).toBe('center');
  });

  it('left-aligns date content using the standard horizontal field padding', () => {
    const schema = createSchema();
    const date = createField({
      id: 'current-date',
      type: 'date',
      label: 'Signing date',
      signer: currentSigner,
      slot: 'date',
      value: '07/14/2026',
      x: 40,
      y: 272,
      width: 118,
      height: 28,
    });

    setInputs({
      ...schema,
      fields: [...schema.fields, date],
    }, currentSigner);

    const element: HTMLElement = fixture.nativeElement;
    const dateField = element.querySelector<HTMLElement>('[data-field-id="current-date"]');
    const style = getComputedStyle(dateField!);

    expect(dateField).not.toBeNull();
    expect(style.justifyContent).toBe('flex-start');
    expect(style.paddingLeft).toBe('8px');
    expect(style.paddingRight).toBe('8px');
  });

  it('uses the same typed image height for signature and initials fields', () => {
    const schema = createSchema();
    const typedImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"></svg>',
    )}`;
    const signature = createField({
      id: 'current-signature',
      type: 'signature',
      label: 'Signature',
      signer: currentSigner,
      slot: 'signature',
      value: typedImage,
      x: 40,
      y: 272,
      width: 154,
      height: 42,
    });
    const initials = createField({
      id: 'current-initials',
      type: 'initials',
      label: 'Initials',
      signer: currentSigner,
      slot: 'initials',
      value: typedImage,
      x: 40,
      y: 340,
      width: 105,
      height: 42,
    });

    setInputs({
      ...schema,
      fields: [...schema.fields, signature, initials],
    }, currentSigner);

    const element: HTMLElement = fixture.nativeElement;
    const signatureField = element.querySelector<HTMLElement>('[data-field-id="current-signature"]');
    const initialsField = element.querySelector<HTMLElement>('[data-field-id="current-initials"]');
    const signatureImage = signatureField?.querySelector<HTMLImageElement>('.is-typed-signature-image');
    const initialsImage = initialsField?.querySelector<HTMLImageElement>('.is-typed-signature-image');

    expect(getComputedStyle(signatureField!).paddingTop).toBe('0px');
    expect(getComputedStyle(initialsField!).paddingTop).toBe('0px');
    expect(getComputedStyle(signatureImage!).height).toBe(getComputedStyle(initialsImage!).height);
  });

  it('hides fields assigned to other signers when showOtherSignerFields is false', () => {
    fixture.componentRef.setInput('showOtherSignerFields', false);
    setInputs(createSchema(), currentSigner);

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('[data-field-id="current-text"]')).not.toBeNull();
    expect(element.querySelector('[data-field-id="current-checkbox"]')).not.toBeNull();
    expect(element.querySelector('[data-field-id="other-text"]')).toBeNull();
    expect(element.querySelector('[data-field-id="unassigned-text"]')).toBeNull();
  });

  it('does not change fields assigned to another signer', () => {
    const emitted: PdfBuilderSchema[] = [];
    const schema = createSchema();
    const subscription = component.schemaChange.subscribe(value => emitted.push(value));
    const state = component as unknown as {
      executeFieldAction: (field: PdfBuilderField) => void;
      fields: () => readonly PdfBuilderField[];
    };

    setInputs(schema, currentSigner);
    state.executeFieldAction(schema.fields.find(field => field.id === 'other-text')!);
    fixture.detectChanges();

    expect(state.fields().find(field => field.id === 'other-text')?.value).toBe('Other value');
    expect(emitted).toEqual([]);
    subscription.unsubscribe();
  });

  it('updates the current signer checkbox and emits the updated schema', () => {
    const emitted: PdfBuilderSchema[] = [];
    const changes: string[] = [];
    const schema = createSchema();
    const schemaSubscription = component.schemaChange.subscribe(value => emitted.push(value));
    const fieldSubscription = component.fieldValueChange.subscribe(change => changes.push(change.value));
    const state = component as unknown as {
      executeFieldAction: (field: PdfBuilderField) => void;
      fields: () => readonly PdfBuilderField[];
    };

    setInputs(schema, currentSigner);
    state.executeFieldAction(schema.fields.find(field => field.id === 'current-checkbox')!);
    fixture.detectChanges();

    expect(state.fields().find(field => field.id === 'current-checkbox')?.value).toBe('true');
    expect(emitted.at(-1)?.fields.find(field => field.id === 'current-checkbox')?.value).toBe('true');
    expect(emitted.at(-1)?.view.selectedFieldId).toBeNull();
    expect(changes).toEqual(['true']);
    schemaSubscription.unsubscribe();
    fieldSubscription.unsubscribe();
  });

  it('opens the signature action on the first click without selecting the field', async () => {
    const schema = createSchema();
    const signature = createField({
      id: 'current-signature',
      type: 'signature',
      label: 'Signature',
      signer: currentSigner,
      slot: 'signature',
      value: '',
      x: 40,
      y: 272,
      width: 154,
      height: 42,
    });

    setInputs({
      ...schema,
      fields: [...schema.fields, signature],
    }, currentSigner);

    const element: HTMLElement = fixture.nativeElement;
    const signatureField = element.querySelector<HTMLElement>('[data-field-id="current-signature"]');

    signatureField!.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    expect(signatureField?.classList.contains('is-selected')).toBe(false);
    expect(document.querySelector('ngs-dialog-container')).not.toBeNull();
    expect(document.body.textContent).toContain('Accept and sign');

    document.querySelector<HTMLButtonElement>('[ngs-dialog-close]')?.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => setTimeout(resolve, 260));
  });

  it('renders an uploaded stamp file as an image instead of its file name', async () => {
    const stamp = createField({
      id: 'current-stamp',
      type: 'stamp',
      label: 'Stamp',
      signer: currentSigner,
      value: '',
      x: 40,
      y: 272,
      width: 180,
      height: 64,
    });
    const schema = createSchema();
    const state = component as unknown as {
      applyStampDialogResult: (
        field: PdfBuilderField,
        result: { type: 'file'; file: File },
      ) => Promise<void>;
      fields: () => readonly PdfBuilderField[];
    };

    setInputs({
      ...schema,
      fields: [...schema.fields, stamp],
    }, currentSigner);

    await state.applyStampDialogResult(stamp, {
      type: 'file',
      file: new File(['stamp'], 'stamp.png', { type: 'image/png' }),
    });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(state.fields().find(field => field.id === stamp.id)).toEqual(expect.objectContaining({
      label: 'Stamp',
      value: 'data:image/png;base64,c3RhbXA=',
    }));
    expect(element
      .querySelector<HTMLImageElement>(`[data-field-id="${stamp.id}"] img.field-image`)
      ?.getAttribute('src')).toBe('data:image/png;base64,c3RhbXA=');
  });

  it('renders an immediately editable text field and emits its value', async () => {
    const changes: string[] = [];
    const subscription = component.fieldValueChange.subscribe(change => changes.push(change.value));

    setInputs(createSchema(), currentSigner);

    const element: HTMLElement = fixture.nativeElement;
    const field = element.querySelector<HTMLElement>('[data-field-id="current-text"]');
    const editor = element.querySelector<HTMLElement>('[data-text-editor-for="current-text"]');

    expect(editor).not.toBeNull();
    expect(editor?.getAttribute('contenteditable')).toBe('true');

    field?.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    expect(document.activeElement).toBe(editor);

    editor!.textContent = 'Signed by current user';
    editor!.dispatchEvent(new InputEvent('input', { bubbles: true }));
    fixture.detectChanges();

    expect(changes.at(-1)).toBe('Signed by current user');
    subscription.unsubscribe();
  });

  it('restores an entered text value when the field is opened again', async () => {
    setInputs(createSchema(), currentSigner);

    const element: HTMLElement = fixture.nativeElement;
    let field = element.querySelector<HTMLElement>('[data-field-id="current-text"]');

    field!.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    const editor = element.querySelector<HTMLElement>('[data-text-editor-for="current-text"]');

    editor!.textContent = 'Persisted value';
    editor!.dispatchEvent(new InputEvent('input', { bubbles: true }));
    editor!.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
    fixture.detectChanges();

    expect(editor?.textContent).toBe('Persisted value');
    expect(editor?.isConnected).toBe(true);

    field = element.querySelector<HTMLElement>('[data-field-id="current-text"]');
    field!.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    expect(document.activeElement).toBe(editor);
    expect(editor?.textContent).toBe('Persisted value');
  });

  it('does not overwrite a newly entered value during deferred editor initialization', async () => {
    setInputs(createSchema(), currentSigner);

    const element: HTMLElement = fixture.nativeElement;
    const field = element.querySelector<HTMLElement>('[data-field-id="current-text"]');

    field!.click();
    fixture.detectChanges();

    const editor = element.querySelector<HTMLElement>('[data-text-editor-for="current-text"]');

    editor!.textContent = 'Fast entered value';
    editor!.dispatchEvent(new InputEvent('input', { bubbles: true }));
    fixture.detectChanges();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    expect(editor?.textContent).toBe('Fast entered value');
  });

  it('never moves or resizes fields in response to pointer gestures', () => {
    const schema = createSchema();
    const state = component as unknown as {
      fields: () => readonly PdfBuilderField[];
    };

    setInputs(schema, currentSigner);

    const element: HTMLElement = fixture.nativeElement;
    const field = element.querySelector<HTMLElement>('[data-field-id="current-text"]');
    const initial = state.fields().find(item => item.id === 'current-text')!;

    field?.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 100,
      clientY: 100,
      pointerId: 7,
    }));
    window.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: 300,
      clientY: 300,
      pointerId: 7,
    }));
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: 300,
      clientY: 300,
      pointerId: 7,
    }));
    fixture.detectChanges();

    expect(state.fields().find(item => item.id === 'current-text')).toMatchObject({
      x: initial.x,
      y: initial.y,
      width: initial.width,
      height: initial.height,
    });
    expect(element.querySelector('.resize-handle')).toBeNull();
  });

  function setInputs(schema: PdfBuilderSchema, signer: PdfBuilderSigner): void {
    fixture.componentRef.setInput('schema', schema);
    fixture.componentRef.setInput('signer', signer);
    fixture.detectChanges();
  }

  function createSchema(): PdfBuilderSchema {
    return {
      version: 1,
      document: {
        name: 'Agreement.pdf',
        source: null,
        sizeLabel: 'Virtual PDF',
        sourcePageCount: 0,
        addedPageCount: 1,
        pages: [
          {
            id: 'virtual-1',
            kind: 'virtual',
            label: 'Page 1',
            width: 595.276,
            height: 841.89,
          },
        ],
      },
      view: {
        activePage: 1,
        selectedFieldId: null,
        activeCanvasTool: 'select',
        pageStripVisible: false,
        libraryCollapsed: true,
        searchPanelVisible: false,
        annotationsPanelVisible: false,
        spreadMode: 'single',
        scrollLayout: 'vertical',
        pageRotation: 0,
        activeSearchQuery: '',
        expandedLayerNodeIds: [],
      },
      fields: [
        createField({
          id: 'current-text',
          type: 'text',
          label: 'Current signer text',
          signer: currentSigner,
          value: '',
          x: 40,
          y: 40,
          width: 180,
          height: 44,
        }),
        createField({
          id: 'current-checkbox',
          type: 'checkbox',
          label: 'Current signer checkbox',
          signer: currentSigner,
          value: '',
          x: 40,
          y: 104,
          width: 16,
          height: 16,
        }),
        createField({
          id: 'other-text',
          type: 'text',
          label: 'Other signer text',
          signer: otherSigner,
          value: 'Other value',
          x: 40,
          y: 144,
          width: 180,
          height: 44,
        }),
        createField({
          id: 'unassigned-text',
          type: 'text',
          label: 'Unassigned text',
          signer: null,
          value: '',
          x: 40,
          y: 208,
          width: 180,
          height: 44,
        }),
      ],
    };
  }

  function createField(
    field: Partial<PdfBuilderField> &
      Pick<PdfBuilderField, 'id' | 'type' | 'label' | 'value' | 'x' | 'y' | 'width' | 'height'>,
  ): PdfBuilderField {
    return {
      binding: '',
      page: 1,
      icon: 'fluent:text-font-24-regular',
      slot: field.type === 'checkbox' ? 'checkbox' : 'primary',
      required: false,
      readonly: false,
      locked: false,
      signer: null,
      ...field,
    };
  }
});
