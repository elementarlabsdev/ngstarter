import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PdfViewer } from '@ngstarter-ui/components/pdf-viewer';

import { PdfBuilder, type PdfBuilderSchema } from './pdf-builder';

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
      documentSource: () => unknown;
      fields: () => readonly unknown[];
      pageCount: () => number;
      selectedField: () => unknown;
    };

    expect(state.documentSource()).toBeNull();
    expect(state.pageCount()).toBe(1);
    expect(state.fields()).toEqual([]);
    expect(state.selectedField()).toBeNull();
    expect(element.querySelectorAll('.overlay-field').length).toBe(0);
    expect(element.querySelectorAll('.blank-pdf-page').length).toBe(1);
    expect(element.querySelector('ngs-pdf-viewer')).toBeNull();
    expect(element.textContent).toContain('0 fields');
    expect(element.textContent).not.toContain('Prepared fields');
    expect(element.textContent).not.toContain('Source');
  });

  it('emits schema changes when builder state changes', async () => {
    const emitted: PdfBuilderSchema[] = [];
    const subscription = component.schemaChange.subscribe(schema => emitted.push(schema));
    const state = component as unknown as {
      activePage: { set: (page: number) => void };
      addField: (type: 'text') => void;
    };

    state.addField('text');
    fixture.detectChanges();
    await Promise.resolve();

    expect(emitted.at(-1)?.fields).toHaveLength(1);
    expect(emitted.at(-1)?.document).toMatchObject({
      source: null,
      sourcePageCount: 0,
      addedPageCount: 1,
    });
    expect(emitted.at(-1)?.document.pages).toHaveLength(1);
    expect(emitted.at(-1)?.document.pages?.[0]).toMatchObject({
      id: 'virtual-1',
      kind: 'virtual',
    });
    expect(emitted.at(-1)?.fields[0]).toMatchObject({
      type: 'text',
      label: 'Text box',
    });

    state.activePage.set(2);
    fixture.detectChanges();
    await Promise.resolve();

    expect(emitted.at(-1)?.view.activePage).toBe(2);
    subscription.unsubscribe();
  });

  it('restores fields and builder state from the schema input', async () => {
    const emitted: PdfBuilderSchema[] = [];
    const subscription = component.schemaChange.subscribe(schema => emitted.push(schema));
    const schema: PdfBuilderSchema = {
      version: 1,
      document: {
        name: 'Restored.pdf',
        source: '/assets/pdf-builder/sample-contract.pdf',
        sizeLabel: '9 KB',
        sourcePageCount: 2,
        addedPageCount: 1,
      },
      view: {
        activePage: 3,
        selectedFieldId: 'field-date-7',
        activeCanvasTool: 'select',
        pageStripVisible: false,
        libraryCollapsed: true,
        searchPanelVisible: true,
        annotationsPanelVisible: false,
        spreadMode: 'two-odd',
        scrollLayout: 'horizontal',
        pageRotation: 1,
        activeSearchQuery: 'effective',
        expandedLayerNodeIds: ['page-3'],
      },
      fields: [
        {
          id: 'field-date-7',
          type: 'date',
          page: 3,
          label: 'Date field',
          binding: '',
          value: '07/12/2026',
          icon: 'fluent:calendar-ltr-24-regular',
          slot: 'date',
          x: 120,
          y: 160,
          width: 118,
          height: 28,
          required: false,
          readonly: false,
          locked: false,
        },
      ],
    };
    const state = component as unknown as {
      activePage: () => number;
      documentName: () => string;
      fields: () => readonly { id: string; type: string; value: string }[];
      libraryCollapsed: () => boolean;
      pageCount: () => number;
      pageStripVisible: () => boolean;
      schema: () => PdfBuilderSchema;
      searchPanelVisible: () => boolean;
      addField: (type: 'text') => void;
    };

    fixture.componentRef.setInput('schema', schema);
    fixture.detectChanges();
    await Promise.resolve();

    expect(state.documentName()).toBe('Restored.pdf');
    expect(state.pageCount()).toBe(3);
    expect(state.activePage()).toBe(3);
    expect(state.pageStripVisible()).toBe(false);
    expect(state.libraryCollapsed()).toBe(true);
    expect(state.searchPanelVisible()).toBe(true);
    expect(state.fields()).toEqual(schema.fields);
    expect(emitted).toEqual([]);

    state.addField('text');
    fixture.detectChanges();
    await Promise.resolve();

    expect(state.fields().at(-1)?.id).toBe('field-text-8');
    subscription.unsubscribe();
  });

  it('normalizes loaded PDF pages into schema pages', async () => {
    const schema: PdfBuilderSchema = {
      version: 1,
      document: {
        name: 'Loaded.pdf',
        source: '/assets/pdf-builder/sample-contract.pdf',
        sizeLabel: '9 KB',
        sourcePageCount: 1,
        addedPageCount: 1,
        pages: [
          {
            id: 'source-1',
            kind: 'source',
            sourcePage: 1,
          },
          {
            id: 'virtual-2',
            kind: 'virtual',
          },
        ],
      },
      view: {
        activePage: 2,
        selectedFieldId: null,
        activeCanvasTool: 'select',
        pageStripVisible: true,
        libraryCollapsed: false,
        searchPanelVisible: false,
        annotationsPanelVisible: false,
        spreadMode: 'single',
        scrollLayout: 'vertical',
        pageRotation: 0,
        activeSearchQuery: '',
        expandedLayerNodeIds: ['page-1', 'page-2'],
      },
      fields: [],
    };
    const state = component as unknown as {
      addedPageCount: () => number;
      documentPages: () => readonly { kind: string; sourcePage?: number }[];
      onPdfLoaded: (event: { pageCount: number }) => void;
      pageCount: () => number;
      sourcePageCount: () => number;
    };

    fixture.componentRef.setInput('schema', schema);
    fixture.detectChanges();
    await Promise.resolve();

    state.onPdfLoaded({ pageCount: 3 });
    fixture.detectChanges();

    expect(state.sourcePageCount()).toBe(3);
    expect(state.addedPageCount()).toBe(1);
    expect(state.pageCount()).toBe(4);
    expect(state.documentPages().map(page => page.kind)).toEqual(['source', 'source', 'source', 'virtual']);
    expect(state.documentPages().slice(0, 3).map(page => page.sourcePage)).toEqual([1, 2, 3]);
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

  it('moves field count and blank page actions from the toolbar to the right panel', () => {
    const element: HTMLElement = fixture.nativeElement;
    const start = element.querySelector<HTMLElement>('.pdf-viewer-toolbar__start');
    const end = element.querySelector<HTMLElement>('.pdf-viewer-toolbar__end');
    const aside = element.querySelector<HTMLElement>('ngs-panel-aside.builder-viewer-aside');
    const state = component as unknown as {
      pageCount: () => number;
    };

    expect(start).not.toBeNull();
    expect(start!.textContent).not.toContain('0 fields');
    expect(start!.querySelector('[aria-label="Add blank page"]')).toBeNull();
    expect(start!.querySelector('[aria-label="Undo"]')).not.toBeNull();
    expect(start!.querySelector('[aria-label="Redo"]')).not.toBeNull();
    expect(end!.querySelector('[aria-label="Add blank page"]')).toBeNull();
    expect(end!.querySelector('[aria-label="Undo"]')).toBeNull();
    expect(end!.querySelector('[aria-label="Redo"]')).toBeNull();
    expect(aside).not.toBeNull();
    expect(aside!.querySelector('.field-sidebar-actions')?.textContent).toContain('0 fields');

    aside!.querySelector<HTMLButtonElement>('[aria-label="Add blank page"]')!.click();
    fixture.detectChanges();

    expect(state.pageCount()).toBe(2);
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
    expect(element.querySelector('ngs-panel-aside.builder-viewer-aside')).not.toBeNull();
    expect(element.querySelector('.field-sidebar-actions')).not.toBeNull();

    searchButton!.click();
    fixture.detectChanges();

    const searchAside = element.querySelector<HTMLElement>('ngs-panel-aside.builder-viewer-aside');

    expect(searchAside).not.toBeNull();
    expect(searchAside!.classList.contains('border-l')).toBe(true);
    expect(searchAside!.className).toContain('w-[var(--ngs-pdf-viewer-aside-width)]');
    expect(searchAside!.querySelector('ngs-pdf-viewer-search')).not.toBeNull();
    expect(searchAside!.querySelector('.field-sidebar-actions')).toBeNull();
    expect(searchAside!.querySelector('ngs-tab-group')).toBeNull();

    annotationsButton!.click();
    fixture.detectChanges();

    const annotationsAside = element.querySelector<HTMLElement>('ngs-panel-aside.builder-viewer-aside');

    expect(annotationsAside).not.toBeNull();
    expect(annotationsAside!.querySelector('ngs-pdf-viewer-annotations')).not.toBeNull();
    expect(annotationsAside!.querySelector('ngs-pdf-viewer-search')).toBeNull();
  });

  it('does not derive annotation cards from builder fields', () => {
    const element: HTMLElement = fixture.nativeElement;
    const annotationsButton = element.querySelector<HTMLButtonElement>('[aria-label="Annotations"]');
    const state = component as unknown as {
      addField: (type: 'text') => void;
      closeFieldSettingsPanel: () => void;
      updateTextFieldValue: (fieldId: string, value: string) => void;
      fields: () => readonly { id: string }[];
    };

    state.addField('text');
    fixture.detectChanges();
    state.updateTextFieldValue(state.fields()[0].id, 'Typed value');
    state.closeFieldSettingsPanel();
    fixture.detectChanges();

    annotationsButton!.click();
    fixture.detectChanges();

    const annotationsAside = element.querySelector<HTMLElement>('ngs-panel-aside.builder-viewer-aside');

    expect(annotationsAside!.querySelector('ngs-pdf-viewer-annotations')).not.toBeNull();
    expect(annotationsAside!.textContent).toContain('No annotations found.');
    expect(annotationsAside!.textContent).not.toContain('PDF Builder');
    expect(annotationsAside!.textContent).not.toContain('Text box');
    expect(annotationsAside!.textContent).not.toContain('Typed value');
    expect(annotationsAside!.textContent).not.toContain('Select');
  });

  it('renders annotations from the annotations input', () => {
    const element: HTMLElement = fixture.nativeElement;
    const annotationsButton = element.querySelector<HTMLButtonElement>('[aria-label="Annotations"]');

    fixture.componentRef.setInput('annotations', [
      {
        id: 'annotation-1',
        type: 'comment',
        label: 'Legal note',
        author: 'Legal Team',
        time: 'Today',
        avatarLabel: 'LT',
        text: 'Please confirm the indemnity clause.',
        pageNumber: 1,
        replyLabel: 'Open',
      },
    ]);
    fixture.detectChanges();

    annotationsButton!.click();
    fixture.detectChanges();

    const annotationsAside = element.querySelector<HTMLElement>('ngs-panel-aside.builder-viewer-aside');

    expect(annotationsAside!.querySelector('ngs-pdf-viewer-annotations')).not.toBeNull();
    expect(annotationsAside!.textContent).toContain('Legal Team');
    expect(annotationsAside!.textContent).toContain('Legal note');
    expect(annotationsAside!.textContent).toContain('Please confirm the indemnity clause.');
    expect(annotationsAside!.textContent).toContain('Open');
    expect(annotationsAside!.textContent).not.toContain('No annotations found.');
  });

  it('does not render a recipients block when there are no recipients', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'signature') => void;
      closeFieldSettingsPanel: () => void;
      fieldSettingsPanelVisible: () => boolean;
    };

    expect(element.querySelector('.field-recipients-panel')).toBeNull();
    expect(element.querySelector('ngs-list')).toBeNull();
    expect(element.textContent).not.toContain('No fields yet');
    expect(element.textContent).not.toContain('No recipients yet');
    expect(element.textContent).not.toContain('Add recipients');
    expect(element.querySelector('.field-sidebar-actions')).not.toBeNull();

    state.addField('signature');
    fixture.detectChanges();

    expect(state.fieldSettingsPanelVisible()).toBe(true);
    expect(element.querySelector('.field-settings-panel')).not.toBeNull();
    expect(element.querySelector('.field-settings-summary')).toBeNull();
    expect(element.querySelector('.field-settings-summary-icon')).toBeNull();

    state.closeFieldSettingsPanel();
    fixture.detectChanges();

    const aside = element.querySelector<HTMLElement>('ngs-panel-aside.builder-viewer-aside');

    expect(aside).not.toBeNull();
    expect(element.querySelector('.field-settings-panel')).toBeNull();
    expect(element.querySelector('.field-recipients-panel')).toBeNull();
    expect(element.querySelector('.field-sidebar-actions')).not.toBeNull();
    expect(aside!.textContent).not.toContain('Add recipients');
    expect(aside!.textContent).not.toContain('Signer');
    expect(aside!.textContent).not.toContain('Signature');
    expect(aside!.textContent).not.toContain('Page 1');
  });

  it('renders recipients from the recipients input without deriving them from fields', () => {
    const element: HTMLElement = fixture.nativeElement;

    fixture.componentRef.setInput('recipients', [
      {
        id: 'pavel',
        name: 'Pavel Salauyou',
        email: 'pavel.salauyou@gmail.com',
        role: 'Signer',
        avatarLabel: 'PS',
        isCurrentUser: true,
      },
      {
        id: 'legal',
        name: 'Legal Approver',
        email: 'legal@example.com',
        role: 'Approver',
      },
    ]);
    fixture.detectChanges();

    const panel = element.querySelector<HTMLElement>('.field-recipients-panel');
    const items = Array.from(element.querySelectorAll<HTMLElement>('.field-recipients-list ngs-list-item'));

    expect(panel).not.toBeNull();
    expect(panel!.textContent).toContain('Add recipients');
    expect(panel!.textContent).toContain('Who are you sending this document to?');
    expect(items).toHaveLength(2);
    expect(items[0].querySelector('ngs-avatar')).not.toBeNull();
    expect(items[0].textContent).toContain('Pavel Salauyou');
    expect(items[0].textContent).toContain('Signer');
    expect(items[0].textContent).toContain('YOU');
    expect(items[0].textContent).toContain('pavel.salauyou@gmail.com');
    expect(items[1].textContent).toContain('Legal Approver');
    expect(items[1].textContent).toContain('legal@example.com');
    expect(panel!.textContent).toContain('Add recipient');
    expect(panel!.textContent).not.toContain('Manage recipients permissions');
    expect(panel!.textContent).not.toContain('Signature');
    expect(panel!.textContent).not.toContain('Page 1');
    expect(element.querySelector('.field-sidebar-actions')).not.toBeNull();
  });

  it('opens field settings from an input recipient only when fieldIds maps to a field', () => {
    const element: HTMLElement = fixture.nativeElement;
    const emitted: unknown[] = [];
    const subscription = component.recipientSelected.subscribe(recipient => emitted.push(recipient));
    const state = component as unknown as {
      addField: (type: 'signature') => void;
      closeFieldSettingsPanel: () => void;
      fields: () => readonly { id: string }[];
      selectedFieldId: () => string | null;
    };

    state.addField('signature');
    fixture.detectChanges();
    state.closeFieldSettingsPanel();
    fixture.detectChanges();

    const fieldId = state.fields()[0].id;

    fixture.componentRef.setInput('recipients', [
      {
        id: 'signer-1',
        name: 'Primary Signer',
        email: 'signer@example.com',
        role: 'Signer',
        fieldIds: [fieldId],
      },
    ]);
    fixture.detectChanges();

    const recipientItem = Array.from(element.querySelectorAll<HTMLElement>('.field-recipients-list ngs-list-item'))
      .find(item => item.textContent?.includes('Primary Signer'));

    recipientItem!.click();
    fixture.detectChanges();

    expect(emitted).toHaveLength(1);
    expect(state.selectedFieldId()).toBe(fieldId);
    expect(element.querySelector('.field-settings-panel')).not.toBeNull();

    subscription.unsubscribe();
  });

  it('opens recipient actions menu and emits recipient action outputs', () => {
    const element: HTMLElement = fixture.nativeElement;
    const editEvents: unknown[] = [];
    const replaceEvents: unknown[] = [];
    const removeEvents: unknown[] = [];
    const subscriptions = [
      component.editRecipientDetails.subscribe(recipient => editEvents.push(recipient)),
      component.replaceRecipient.subscribe(recipient => replaceEvents.push(recipient)),
      component.removeRecipient.subscribe(recipient => removeEvents.push(recipient)),
    ];

    fixture.componentRef.setInput('recipients', [
      {
        id: 'pavel',
        name: 'Pavel Salauyou',
        email: 'pavel.salauyou@gmail.com',
        role: 'Signer',
        avatarLabel: 'PS',
      },
    ]);
    fixture.detectChanges();

    const openMenu = () => {
      element.querySelector<HTMLButtonElement>('button[aria-label="Recipient actions"]')!.click();
      fixture.detectChanges();
    };

    openMenu();

    expect(document.body.textContent).toContain('Edit personal details');
    expect(document.body.textContent).toContain('Replace recipient');
    expect(document.body.textContent).toContain('Remove');

    document.querySelector<HTMLButtonElement>('.ngs-menu-panel [ngs-menu-item]')!.click();
    fixture.detectChanges();

    openMenu();
    Array.from(document.querySelectorAll<HTMLButtonElement>('.ngs-menu-panel [ngs-menu-item]'))[1].click();
    fixture.detectChanges();

    openMenu();
    Array.from(document.querySelectorAll<HTMLButtonElement>('.ngs-menu-panel [ngs-menu-item]'))[2].click();
    fixture.detectChanges();

    expect(editEvents).toHaveLength(1);
    expect(replaceEvents).toHaveLength(1);
    expect(removeEvents).toHaveLength(1);

    subscriptions.forEach(subscription => subscription.unsubscribe());
  });

  it('opens add recipient popover and emits search/create events', () => {
    const element: HTMLElement = fixture.nativeElement;
    const addEvents: unknown[] = [];
    const searchEvents: string[] = [];
    const createEvents: string[] = [];
    const subscriptions = [
      component.addRecipient.subscribe(() => addEvents.push(true)),
      component.recipientSearchChanged.subscribe(query => searchEvents.push(query)),
      component.createRecipientContact.subscribe(query => createEvents.push(query)),
    ];

    fixture.componentRef.setInput('recipients', [
      {
        id: 'pavel',
        name: 'Pavel Salauyou',
      },
    ]);
    fixture.detectChanges();

    expect(document.querySelector('.ngs-popover-panel [aria-label="Add recipient"]')).toBeNull();

    const addButton = Array.from(element.querySelectorAll<HTMLButtonElement>('button'))
      .find(button => button.textContent?.includes('Add recipient'));

    addButton!.click();
    fixture.detectChanges();

    const panel = document.querySelector<HTMLElement>('.ngs-popover-panel [aria-label="Add recipient"]');
    const input = panel!.querySelector<HTMLInputElement>('input[ngsInput]')!;

    expect(addEvents).toHaveLength(1);
    expect(panel).not.toBeNull();
    expect(panel!.textContent).toContain('Create new contact');
    expect(input.placeholder).toBe('Start typing recipient email, name or group');

    input.value = 'new@example.com';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const createButton = Array.from(panel!.querySelectorAll<HTMLButtonElement>('button'))
      .find(button => button.textContent?.includes('Create new contact'));

    createButton!.click();
    fixture.detectChanges();

    expect(searchEvents.at(-1)).toBe('new@example.com');
    expect(createEvents).toEqual(['new@example.com']);

    subscriptions.forEach(subscription => subscription.unsubscribe());
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

    const fieldNode = state.layerTree()[0].children?.[0];
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

  it('does not show the imported PDF base layer in the layers tree', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      layerTree: () => readonly { children?: readonly { label: string }[] }[];
    };

    expect(state.layerTree()[0].children ?? []).toEqual([]);
    expect(element.textContent).not.toContain('Imported PDF layer');
  });

  it('keeps page layer rows expandable even before fields are added', () => {
    const state = component as unknown as {
      hasLayerChildren: (_index: number, node: { children?: readonly unknown[] }) => boolean;
      layerTree: () => readonly { children?: readonly unknown[] }[];
    };

    expect(state.layerTree()[0].children).toEqual([]);
    expect(state.hasLayerChildren(0, state.layerTree()[0])).toBe(true);
  });

  it('does not rebuild layer data or render selected as metadata', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      activePage: { set: (page: number) => void };
      addField: (type: 'stamp') => void;
      layerTree: () => readonly { meta?: string; children?: readonly { meta?: string }[] }[];
      selectedFieldId: { set: (fieldId: string | null) => void };
    };

    state.addField('stamp');
    fixture.detectChanges();

    const treeBefore = state.layerTree();
    const fieldId = treeBefore[0].children?.[0] ? 'field-stamp-1' : null;

    state.activePage.set(2);
    state.selectedFieldId.set(fieldId);
    fixture.detectChanges();

    expect(state.layerTree()).toBe(treeBefore);
    expect(state.layerTree()[0].meta).toBeUndefined();
    expect(state.layerTree()[0].children?.[0]?.meta).toBeUndefined();
    expect(element.textContent).not.toContain('selected');
  });

  it('renders required layer fields as a red asterisk marker instead of metadata text', async () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'initials') => void;
      layerTree: () => readonly { children?: readonly { label: string; meta?: string; required?: boolean }[] }[];
    };

    state.addField('initials');
    fixture.detectChanges();

    Array.from(element.querySelectorAll<HTMLElement>('.ngs-tab-label'))
      .find(label => label.textContent?.trim() === 'Layers')
      ?.click();
    fixture.detectChanges();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    fixture.detectChanges();

    const requiredNode = state.layerTree()[0].children?.[0];
    const marker = element.querySelector<HTMLElement>('.layer-required-marker');

    expect(requiredNode).toMatchObject({
      label: 'Initials',
      required: true,
      meta: undefined,
    });
    expect(marker).not.toBeNull();
    expect(marker!.textContent?.trim()).toBe('*');
    expect(marker!.getAttribute('aria-label')).toBe('Required');
    expect(element.textContent).not.toContain('required');
  });

  it('toggles the selected field required state from the right settings panel', async () => {
    const element: HTMLElement = fixture.nativeElement;
    const emitted: PdfBuilderSchema[] = [];
    const subscription = component.schemaChange.subscribe(schema => emitted.push(schema));
    const state = component as unknown as {
      addField: (type: 'text') => void;
      fields: () => readonly { required: boolean }[];
    };

    state.addField('text');
    fixture.detectChanges();

    const requiredButton = element.querySelector<HTMLButtonElement>('.field-settings-actions button[aria-pressed]');

    expect(requiredButton).not.toBeNull();
    expect(requiredButton!.getAttribute('aria-pressed')).toBe('false');
    expect(requiredButton!.querySelector('ngs-icon')?.getAttribute('name')).toBe('fluent:text-asterisk-20-regular');

    requiredButton!.click();
    fixture.detectChanges();
    await Promise.resolve();

    expect(state.fields()[0].required).toBe(true);
    expect(emitted.at(-1)?.fields[0].required).toBe(true);
    expect(element.querySelector<HTMLButtonElement>('.field-settings-actions button[aria-pressed]')!.getAttribute('aria-pressed')).toBe('true');
    expect(requiredButton!.classList.contains('is-active')).toBe(true);

    subscription.unsubscribe();
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
      documentPages: () => readonly { kind: string }[];
      pageCount: () => number;
    };

    expect(state.pageCount()).toBe(1);
    expect(state.addedPageCount()).toBe(1);

    state.addBlankPage();
    fixture.detectChanges();

    expect(state.addedPageCount()).toBe(2);
    expect(state.pageCount()).toBe(2);
    expect(state.activePage()).toBe(2);
    expect(state.documentPages().map(page => page.kind)).toEqual(['virtual', 'virtual']);
    expect(element.querySelectorAll('.page-thumbnail').length).toBe(2);
    expect(element.querySelector('.blank-pdf-page')).not.toBeNull();
  });

  it('uses a thumbnail scale that keeps loaded PDF pages inside the preview frame', () => {
    fixture.componentRef.setInput('schema', {
      version: 1,
      document: {
        name: 'Loaded.pdf',
        source: '/assets/pdf-builder/sample-contract.pdf',
        sizeLabel: '9 KB',
        sourcePageCount: 1,
        addedPageCount: 0,
        pages: [
          {
            id: 'source-1',
            kind: 'source',
            sourcePage: 1,
          },
        ],
      },
      view: {
        activePage: 1,
        selectedFieldId: null,
        activeCanvasTool: 'select',
        pageStripVisible: true,
        libraryCollapsed: false,
        searchPanelVisible: false,
        annotationsPanelVisible: false,
        spreadMode: 'single',
        scrollLayout: 'vertical',
        pageRotation: 0,
        activeSearchQuery: '',
        expandedLayerNodeIds: ['page-1'],
      },
      fields: [],
    } satisfies PdfBuilderSchema);
    fixture.detectChanges();

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

    expect(Number.parseFloat(overlayField!.style.getPropertyValue('--pdf-builder-field-left'))).toBeCloseTo(field.x * scale, 2);
    expect(Number.parseFloat(overlayField!.style.getPropertyValue('--pdf-builder-field-top'))).toBeCloseTo(field.y * scale, 2);
    expect(Number.parseFloat(overlayField!.style.getPropertyValue('--pdf-builder-field-width'))).toBeCloseTo(field.width * scale, 2);
    expect(Number.parseFloat(overlayField!.style.getPropertyValue('--pdf-builder-field-height'))).toBeCloseTo(field.height * scale, 2);
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

  it('uses compact horizontal metrics for date fields', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'date') => void;
      fields: () => readonly { label: string; binding: string; width: number; height: number; value: string }[];
    };

    state.addField('date');
    fixture.detectChanges();

    expect(state.fields()[0]).toMatchObject({
      label: 'Date field',
      binding: '',
      value: '',
      width: 118,
      height: 28,
    });
    expect(element.querySelector('.overlay-type-date')?.textContent).toContain('Select date');
  });

  it('opens a datepicker for date fields and inserts the selected date', async () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'date') => void;
      fields: () => readonly { id: string; value: string }[];
    };

    state.addField('date');
    fixture.detectChanges();

    const field = state.fields()[0];
    const overlayField = element.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`);

    expect(overlayField).not.toBeNull();
    expect(overlayField!.querySelector('ngs-icon')).not.toBeNull();

    overlayField!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    const calendarCell = document.querySelector<HTMLElement>('.ngs-calendar-cell:not(.ngs-calendar-cell-empty)');

    expect(calendarCell).not.toBeNull();

    calendarCell!.click();
    fixture.detectChanges();

    expect(state.fields()[0].value).not.toBe('');
    expect(element.querySelector('.overlay-type-date')?.textContent).toContain(state.fields()[0].value);
    expect(element.querySelector('.overlay-type-date ngs-icon')).toBeNull();
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
      width: 16,
      height: 16,
    });
    expect(checkbox).not.toBeNull();
    expect(checkbox!.textContent?.trim()).toBe('');
    expect(checkbox!.querySelector('.field-badge')).toBeNull();
    expect(checkbox!.querySelector('.field-value')).toBeNull();
  });

  it('shows only the checkbox square while dragging a checkbox tool', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      beginToolPlacement: (event: PointerEvent, type: 'checkbox') => void;
    };

    state.beginToolPlacement(new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 100,
      clientY: 100,
      pointerId: 11,
    }), 'checkbox');
    fixture.detectChanges();

    const ghost = element.querySelector<HTMLElement>('.placement-ghost');

    expect(ghost).not.toBeNull();
    expect(ghost!.classList.contains('is-checkbox')).toBe(true);
    expect(document.body.classList.contains('ngs-pdf-builder-drag-cursor')).toBe(true);
    expect(ghost!.textContent?.trim()).toBe('');
    expect(ghost!.querySelector('.field-badge')).toBeNull();
    expect(ghost!.querySelector('ngs-icon')).toBeNull();

    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: 100,
      clientY: 100,
      pointerId: 11,
    }));
    fixture.detectChanges();

    expect(document.body.classList.contains('ngs-pdf-builder-drag-cursor')).toBe(false);
  });

  it('drops placed fields at the last visible ghost position', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      beginToolPlacement: (event: PointerEvent, type: 'signature') => void;
      fields: () => readonly { x: number; y: number; width: number; height: number }[];
    };
    const pageShell = element.querySelector<HTMLElement>('.pdf-page-shell[data-page-number="1"]');

    expect(pageShell).not.toBeNull();

    pageShell!.getBoundingClientRect = () => ({
      x: 100,
      y: 40,
      top: 40,
      left: 100,
      right: 914,
      bottom: 1160,
      width: 814,
      height: 1120,
      toJSON: () => undefined,
    });

    state.beginToolPlacement(new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 200,
      clientY: 200,
      pointerId: 12,
    }), 'signature');
    fixture.detectChanges();

    window.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: 300,
      clientY: 400,
      pointerId: 12,
    }));
    fixture.detectChanges();

    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: 320,
      clientY: 420,
      pointerId: 12,
    }));
    fixture.detectChanges();

    const field = state.fields()[0];
    const xScale = 814 / 595.276;
    const yScale = 1120 / 841.89;
    const ghostLeftX = (300 - 100) / xScale;
    const ghostTopY = (400 - 40) / yScale;

    expect(field.x).toBeCloseTo(ghostLeftX, 6);
    expect(field.y).toBeCloseTo(ghostTopY, 6);
  });

  it('does not center placed fields while placing them', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      beginToolPlacement: (event: PointerEvent, type: 'text' | 'variable') => void;
      fields: () => readonly { type: string; x: number; y: number; width: number; height: number }[];
      syncCanvasGeometry: () => void;
    };
    const pageShell = element.querySelector<HTMLElement>('.pdf-page-shell[data-page-number="1"]');

    expect(pageShell).not.toBeNull();

    pageShell!.getBoundingClientRect = () => ({
      x: 100,
      y: 40,
      top: 40,
      left: 100,
      right: 914,
      bottom: 1160,
      width: 814,
      height: 1120,
      toJSON: () => undefined,
    });

    state.beginToolPlacement(new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 220,
      clientY: 180,
      pointerId: 13,
    }), 'text');
    fixture.detectChanges();

    let ghost = element.querySelector<HTMLElement>('.placement-ghost');

    expect(ghost).not.toBeNull();

    window.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: 300,
      clientY: 400,
      pointerId: 13,
    }));
    fixture.detectChanges();
    state.syncCanvasGeometry();

    ghost = element.querySelector<HTMLElement>('.placement-ghost');

    const xScale = 814 / 595.276;
    const yScale = 1120 / 841.89;
    const topLeftX = (300 - 100) / xScale;
    const topLeftY = (400 - 40) / yScale;

    expect(Number.parseFloat(ghost!.style.getPropertyValue('--pdf-builder-ghost-left'))).toBeCloseTo(300, 6);
    expect(Number.parseFloat(ghost!.style.getPropertyValue('--pdf-builder-ghost-top'))).toBeCloseTo(400, 6);

    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: 300,
      clientY: 400,
      pointerId: 13,
    }));
    fixture.detectChanges();

    const textField = state.fields()[0];

    expect(textField.type).toBe('text');
    expect(textField.x).toBeCloseTo(topLeftX, 6);
    expect(textField.y).toBeCloseTo(topLeftY, 6);

    state.beginToolPlacement(new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 260,
      clientY: 240,
      pointerId: 14,
    }), 'variable');
    fixture.detectChanges();

    ghost = element.querySelector<HTMLElement>('.placement-ghost');

    expect(ghost).not.toBeNull();

    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: 320,
      clientY: 420,
      pointerId: 14,
    }));
    fixture.detectChanges();

    const variableField = state.fields()[1];

    expect(variableField.type).toBe('variable');
    expect(variableField.x).toBeCloseTo((260 - 100) / xScale, 6);
    expect(variableField.y).toBeCloseTo((240 - 40) / yScale, 6);
  });

  it('places signature initials and stamp fields from the pointer top-left', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      beginToolPlacement: (event: PointerEvent, type: 'signature' | 'initials' | 'stamp') => void;
      fields: () => readonly { type: string; x: number; y: number }[];
    };
    const pageShell = element.querySelector<HTMLElement>('.pdf-page-shell[data-page-number="1"]');

    expect(pageShell).not.toBeNull();

    pageShell!.getBoundingClientRect = () => ({
      x: 100,
      y: 40,
      top: 40,
      left: 100,
      right: 914,
      bottom: 1160,
      width: 814,
      height: 1120,
      toJSON: () => undefined,
    });

    const xScale = 814 / 595.276;
    const yScale = 1120 / 841.89;
    const types = ['signature', 'initials', 'stamp'] as const;

    types.forEach((type, index) => {
      const clientX = 220 + index * 32;
      const clientY = 180 + index * 36;
      const pointerId = 16 + index;

      state.beginToolPlacement(new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        clientX,
        clientY,
        pointerId,
      }), type);
      fixture.detectChanges();

      window.dispatchEvent(new PointerEvent('pointerup', {
        bubbles: true,
        clientX,
        clientY,
        pointerId,
      }));
      fixture.detectChanges();

      const field = state.fields()[index];

      expect(field.type).toBe(type);
      expect(field.x).toBeCloseTo((clientX - 100) / xScale, 6);
      expect(field.y).toBeCloseTo((clientY - 40) / yScale, 6);
    });
  });

  it('keeps the visible placement ghost aligned with the final clamped drop position', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      beginToolPlacement: (event: PointerEvent, type: 'signature') => void;
      fields: () => readonly { x: number; y: number; width: number; height: number }[];
      syncCanvasGeometry: () => void;
    };
    const pageShell = element.querySelector<HTMLElement>('.pdf-page-shell[data-page-number="1"]');

    expect(pageShell).not.toBeNull();

    pageShell!.getBoundingClientRect = () => ({
      x: 100,
      y: 40,
      top: 40,
      left: 100,
      right: 914,
      bottom: 1160,
      width: 814,
      height: 1120,
      toJSON: () => undefined,
    });

    state.beginToolPlacement(new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 900,
      clientY: 1110,
      pointerId: 15,
    }), 'signature');
    fixture.detectChanges();
    state.syncCanvasGeometry();

    const ghost = element.querySelector<HTMLElement>('.placement-ghost');
    const xScale = 814 / 595.276;
    const yScale = 1120 / 841.89;
    const expectedFieldX = 595.276 - 154;
    const expectedFieldY = 841.89 - 42;
    const expectedGhostLeft = 100 + expectedFieldX * xScale;
    const expectedGhostTop = 40 + expectedFieldY * yScale;

    expect(ghost).not.toBeNull();
    expect(Number.parseFloat(ghost!.style.getPropertyValue('--pdf-builder-ghost-left'))).toBeCloseTo(expectedGhostLeft, 6);
    expect(Number.parseFloat(ghost!.style.getPropertyValue('--pdf-builder-ghost-top'))).toBeCloseTo(expectedGhostTop, 6);

    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: 900,
      clientY: 1110,
      pointerId: 15,
    }));
    fixture.detectChanges();

    const field = state.fields()[0];

    expect(field.x).toBeCloseTo(expectedFieldX, 6);
    expect(field.y).toBeCloseTo(expectedFieldY, 6);
  });

  it('renders dropped fields at the same screen position as the placement ghost when page scale differs from pdf scale', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      beginToolPlacement: (event: PointerEvent, type: 'signature') => void;
      fields: () => readonly { id: string; x: number; y: number }[];
      syncCanvasGeometry: () => void;
    };
    const pageShell = element.querySelector<HTMLElement>('.pdf-page-shell[data-page-number="1"]');

    expect(pageShell).not.toBeNull();

    pageShell!.getBoundingClientRect = () => ({
      x: 100,
      y: 40,
      top: 40,
      left: 100,
      right: 900,
      bottom: 1140,
      width: 800,
      height: 1100,
      toJSON: () => undefined,
    });

    state.beginToolPlacement(new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: 520,
      clientY: 360,
      pointerId: 30,
    }), 'signature');
    fixture.detectChanges();
    state.syncCanvasGeometry();

    const ghost = element.querySelector<HTMLElement>('.placement-ghost');

    expect(ghost).not.toBeNull();
    expect(Number.parseFloat(ghost!.style.getPropertyValue('--pdf-builder-ghost-left'))).toBeCloseTo(520, 6);
    expect(Number.parseFloat(ghost!.style.getPropertyValue('--pdf-builder-ghost-top'))).toBeCloseTo(360, 6);

    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: 520,
      clientY: 360,
      pointerId: 30,
    }));
    fixture.detectChanges();
    state.syncCanvasGeometry();

    const field = state.fields()[0];
    const overlayField = element.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`);

    expect(overlayField).not.toBeNull();
    expect(Number.parseFloat(overlayField!.style.getPropertyValue('--pdf-builder-field-left'))).toBeCloseTo(420, 6);
    expect(Number.parseFloat(overlayField!.style.getPropertyValue('--pdf-builder-field-top'))).toBeCloseTo(320, 6);
  });

  it('shows variable fields with a token and exposes a binding menu action', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'variable') => void;
      applyVariableBinding: (binding: { label: string; path: string }) => void;
      fields: () => readonly { id: string; binding: string; value: string }[];
      getVariableBindingLabel: (field: { binding: string; type: 'variable' }) => string;
    };

    state.addField('variable');
    fixture.detectChanges();

    const field = state.fields()[0];
    const variable = element.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`);
    const bindButton = Array.from(element.querySelectorAll<HTMLButtonElement>('.field-settings-actions button'))
      .find(button => button.textContent?.includes('Select binding'));

    expect(field.binding).toBe('');
    expect(field.value).toBe('{{variable}}');
    expect(variable).not.toBeNull();
    expect(variable!.textContent).toContain('{{variable}}');
    expect(variable!.querySelector('.variable-token')?.textContent?.trim()).toBe('{{variable}}');
    expect(variable!.querySelector('ngs-icon')).not.toBeNull();
    expect(variable!.classList.contains('overlay-type-variable')).toBe(true);
    expect(variable!.classList.contains('is-filled')).toBe(false);
    expect(bindButton).not.toBeNull();

    state.applyVariableBinding({ label: 'Company name', path: 'company.name' });
    fixture.detectChanges();

    expect(state.fields()[0]).toMatchObject({
      binding: 'company.name',
      value: '{{company.name}}',
    });
    expect(state.getVariableBindingLabel({ binding: 'company.name', type: 'variable' })).toBe('Company name');
    expect(variable!.textContent).toContain('{{company.name}}');
    expect(variable!.querySelector('.variable-token')?.textContent?.trim()).toBe('{{company.name}}');
    expect(variable!.querySelector('ngs-icon')).toBeNull();
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

  it('expands text fields when wrapped text needs field padding space', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'text') => void;
      fields: () => readonly { id: string; height: number; value: string }[];
    };

    state.addField('text');
    fixture.detectChanges();

    const field = state.fields()[0];
    const overlayField = element.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`);

    overlayField!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const editor = element.querySelector<HTMLElement>(`[contenteditable][data-text-editor-for="${field.id}"]`);

    expect(editor).not.toBeNull();

    Object.defineProperty(editor!, 'scrollHeight', {
      configurable: true,
      value: 34,
    });
    editor!.textContent = 'First wrapped line\nSecond wrapped line';
    editor!.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(state.fields()[0].height).toBeGreaterThan(field.height);
  });

  it('does not expand text fields while typed content stays on one line', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'text') => void;
      fields: () => readonly { id: string; height: number; value: string }[];
    };

    state.addField('text');
    fixture.detectChanges();

    const field = state.fields()[0];
    const overlayField = element.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`);

    overlayField!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const editor = element.querySelector<HTMLElement>(`[contenteditable][data-text-editor-for="${field.id}"]`);

    expect(editor).not.toBeNull();

    Object.defineProperty(editor!, 'scrollHeight', {
      configurable: true,
      value: 22,
    });
    editor!.textContent = 'Single line';
    editor!.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(state.fields()[0].value).toBe('Single line');
    expect(state.fields()[0].height).toBe(field.height);
  });

  it('keeps the contenteditable caret position while typing in text fields', async () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'text') => void;
      fields: () => readonly { id: string; value: string }[];
      updateTextFieldValue: (fieldId: string, value: string) => void;
    };

    state.addField('text');
    fixture.detectChanges();

    const field = state.fields()[0];

    state.updateTextFieldValue(field.id, 'Hello');
    fixture.detectChanges();

    element.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`)!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    fixture.detectChanges();

    const editor = element.querySelector<HTMLElement>(`[contenteditable][data-text-editor-for="${field.id}"]`);

    expect(editor).not.toBeNull();
    expect(editor!.textContent).toBe('Hello');

    const textNode = editor!.firstChild!;

    await new Promise<void>(resolve => setTimeout(resolve, 0));

    expect(getSelection()?.isCollapsed).toBe(true);
    expect(getSelection()?.anchorNode).toBe(textNode);
    expect(getSelection()?.anchorOffset).toBe('Hello'.length);

    const range = document.createRange();

    range.setStart(textNode, 2);
    range.collapse(true);
    getSelection()?.removeAllRanges();
    getSelection()?.addRange(range);

    textNode.textContent = 'He!llo';
    range.setStart(textNode, 3);
    range.collapse(true);
    getSelection()?.removeAllRanges();
    getSelection()?.addRange(range);
    editor!.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(state.fields()[0].value).toBe('He!llo');
    expect(getSelection()?.anchorNode).toBe(textNode);
    expect(getSelection()?.anchorOffset).toBe(3);
  });

  it('shows one resize handle only for expandable selected fields', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'text' | 'variable' | 'checkbox') => void;
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

    const variableHandles = element.querySelectorAll('.resize-handle');

    expect(variableHandles.length).toBe(1);
    expect(variableHandles[0].classList.contains('handle-e')).toBe(true);
    expect(element.querySelector('.handle-se')).toBeNull();

    state.addField('checkbox');
    fixture.detectChanges();

    const checkboxHandles = element.querySelectorAll('.resize-handle');

    expect(checkboxHandles.length).toBe(1);
    expect(checkboxHandles[0].classList.contains('handle-se')).toBe(true);
  });

  it('shows a resize handle when hovering expandable fields', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'text' | 'variable') => void;
      fields: () => readonly { id: string }[];
      selectedFieldId: { set: (fieldId: string | null) => void };
    };

    state.addField('text');
    fixture.detectChanges();

    const field = state.fields()[0];
    const overlayField = element.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`);

    state.selectedFieldId.set(null);
    fixture.detectChanges();

    expect(element.querySelector('.resize-handle')).toBeNull();

    overlayField!.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    fixture.detectChanges();

    expect(element.querySelector('.resize-handle.handle-se')).not.toBeNull();

    overlayField!.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
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
    expect(element.querySelector('.selection-toolbar')).toBeNull();

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

  it('resizes variable fields horizontally without changing their height', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'variable') => void;
      fields: () => readonly { id: string; x: number; y: number; width: number; height: number }[];
      fieldResize: () => unknown;
    };

    state.addField('variable');
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
    const handle = element.querySelector<HTMLElement>('.resize-handle.handle-e');

    expect(handle).not.toBeNull();

    handle!.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: field.x + field.width,
      clientY: field.y + field.height / 2,
      pointerId: 9,
    }));
    fixture.detectChanges();

    expect(state.fieldResize()).not.toBeNull();

    window.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: field.x + field.width - 1000,
      clientY: field.y + field.height + 1000,
      pointerId: 9,
    }));
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: field.x + field.width - 1000,
      clientY: field.y + field.height + 1000,
      pointerId: 9,
    }));
    fixture.detectChanges();

    const resizedField = state.fields()[0];

    expect(resizedField.width).toBe(72);
    expect(resizedField.height).toBe(field.height);
    expect(state.fieldResize()).toBeNull();
  });

  it('resizes date fields horizontally without changing their height', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'date') => void;
      fields: () => readonly { id: string; x: number; y: number; width: number; height: number }[];
      fieldResize: () => unknown;
    };

    state.addField('date');
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
    const handle = element.querySelector<HTMLElement>('.overlay-type-date .resize-handle.handle-e');

    expect(handle).not.toBeNull();

    handle!.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: field.x + field.width,
      clientY: field.y + field.height / 2,
      pointerId: 31,
    }));
    fixture.detectChanges();

    expect(state.fieldResize()).not.toBeNull();

    window.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: field.x + field.width - 1000,
      clientY: field.y + field.height + 1000,
      pointerId: 31,
    }));
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: field.x + field.width - 1000,
      clientY: field.y + field.height + 1000,
      pointerId: 31,
    }));
    fixture.detectChanges();

    const resizedField = state.fields()[0];

    expect(resizedField.width).toBe(82);
    expect(resizedField.height).toBe(field.height);
    expect(state.fieldResize()).toBeNull();
  });

  it('resizes checkbox fields as squares up to twice their default size', () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'checkbox') => void;
      fields: () => readonly { id: string; x: number; y: number; width: number; height: number }[];
      fieldResize: () => unknown;
    };

    state.addField('checkbox');
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
      pointerId: 10,
    }));
    fixture.detectChanges();

    expect(state.fieldResize()).not.toBeNull();

    window.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: field.x + field.width + 1000,
      clientY: field.y + field.height + 1000,
      pointerId: 10,
    }));
    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: field.x + field.width + 1000,
      clientY: field.y + field.height + 1000,
      pointerId: 10,
    }));
    fixture.detectChanges();

    const resizedField = state.fields()[0];

    expect(resizedField.width).toBe(32);
    expect(resizedField.height).toBe(32);
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
    expect(document.body.classList.contains('ngs-pdf-builder-drag-cursor')).toBe(true);

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

    expect(draggedField.x).toBeCloseTo(595.276 - draggedField.width, 6);
    expect(draggedField.y).toBeCloseTo(841.89 - draggedField.height, 6);
    expect(state.fieldDrag()).toBeNull();
    expect(document.body.classList.contains('ngs-pdf-builder-drag-cursor')).toBe(false);
  });

  it('keeps field settings in the right panel after clicking an already selected field again', async () => {
    const element: HTMLElement = fixture.nativeElement;
    const state = component as unknown as {
      addField: (type: 'initials') => void;
      fieldSettingsPanelVisible: () => boolean;
      fields: () => readonly { id: string; x: number; y: number; width: number; height: number }[];
      fieldDrag: () => unknown;
    };

    state.addField('initials');
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

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    fixture.detectChanges();

    const field = state.fields()[0];
    const overlayField = element.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`);

    expect(overlayField).not.toBeNull();
    expect(element.querySelector('.selection-toolbar')).toBeNull();
    expect(element.querySelector('.field-settings-panel')).not.toBeNull();
    expect(state.fieldSettingsPanelVisible()).toBe(true);

    overlayField!.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true,
      button: 0,
      clientX: field.x + 4,
      clientY: field.y + 4,
      pointerId: 3,
    }));
    fixture.detectChanges();

    expect(state.fieldDrag()).not.toBeNull();
    expect(element.querySelector('.selection-toolbar')).toBeNull();
    expect(element.querySelector('.field-settings-panel')).not.toBeNull();

    window.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true,
      clientX: field.x + 4,
      clientY: field.y + 4,
      pointerId: 3,
    }));
    fixture.detectChanges();

    expect(state.fieldDrag()).toBeNull();

    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    fixture.detectChanges();

    expect(element.querySelector('.selection-toolbar')).toBeNull();
    expect(element.querySelector('.field-settings-panel')).not.toBeNull();
    expect(state.fieldSettingsPanelVisible()).toBe(true);
  });
});
